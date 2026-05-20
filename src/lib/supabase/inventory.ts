import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type MedicineMasterRow = Database["public"]["Tables"]["medicine_master"]["Row"];
type MedicineMasterInsert = Database["public"]["Tables"]["medicine_master"]["Insert"];
type MedicineBatchRow = Database["public"]["Tables"]["medicine_batches"]["Row"];
type MedicineBatchInsert = Database["public"]["Tables"]["medicine_batches"]["Insert"];
type MedicineBatchUpdate = Database["public"]["Tables"]["medicine_batches"]["Update"];

export type MedicineBatchWithDetails = MedicineBatchRow & {
  medicine_master: Pick<
    MedicineMasterRow,
    "generic_name" | "brand_name" | "strength" | "dosage_form" | "category" | "prescription_required"
  > | null;
};

/**
 * Retrieve the master medicine directory list.
 * Supports optional search query on generic_name or brand_name.
 */
export async function getMedicineMaster(searchQuery?: string): Promise<MedicineMasterRow[]> {
  const supabase = await createClient();
  let query = supabase.from("medicine_master").select("*");

  if (searchQuery && searchQuery.trim() !== "") {
    const cleanSearch = `%${searchQuery.trim()}%`;
    query = query.or(`generic_name.ilike.${cleanSearch},brand_name.ilike.${cleanSearch}`);
  }

  const { data, error } = await query.order("generic_name", { ascending: true });

  if (error) {
    throw new Error(`Unable to fetch medicine master directory: ${error.message}`);
  }

  return data || [];
}

/**
 * Find a specific medicine master record matching generic/brand/strength/dosage.
 */
export async function findMedicineMaster(
  genericName: string,
  brandName: string | null,
  strength: string,
  dosageForm: string
): Promise<MedicineMasterRow | null> {
  const supabase = await createClient();
  const query = supabase
    .from("medicine_master")
    .select("*")
    .eq("generic_name", genericName.trim())
    .eq("strength", strength.trim())
    .eq("dosage_form", dosageForm.trim());

  if (brandName && brandName.trim() !== "") {
    query.eq("brand_name", brandName.trim());
  } else {
    query.is("brand_name", null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Error searching medicine master: ${error.message}`);
  }

  return data;
}

/**
 * Create a new medicine master record in the directory.
 */
export async function createMedicineMaster(values: MedicineMasterInsert): Promise<MedicineMasterRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_master")
    .insert({
      generic_name: values.generic_name.trim(),
      brand_name: values.brand_name?.trim() || null,
      strength: values.strength.trim(),
      dosage_form: values.dosage_form.trim(),
      category: values.category?.trim() || null,
      description: values.description?.trim() || null,
      prescription_required: values.prescription_required ?? false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to create medicine master entry: ${error.message}`);
  }

  return data;
}

/**
 * Fetch all medicine batch inventory records for a specific health center.
 * Includes joined medicine master details.
 */
export async function getInventoryBatches(healthCenterId: string): Promise<MedicineBatchWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_batches")
    .select(
      `
      *,
      medicine_master (
        generic_name,
        brand_name,
        strength,
        dosage_form,
        category,
        prescription_required
      )
    `
    )
    .eq("health_center_id", healthCenterId)
    .order("expiry_date", { ascending: true });

  if (error) {
    throw new Error(`Unable to load center inventory batches: ${error.message}`);
  }

  return (data as unknown as MedicineBatchWithDetails[]) || [];
}

/**
 * Find a specific batch record by medicine, center, and batch number.
 */
export async function findMedicineBatch(
  medicineId: string,
  healthCenterId: string,
  batchNumber: string
): Promise<MedicineBatchRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_batches")
    .select("*")
    .eq("medicine_id", medicineId)
    .eq("health_center_id", healthCenterId)
    .eq("batch_number", batchNumber.trim())
    .maybeSingle();

  if (error) {
    throw new Error(`Error searching medicine batch: ${error.message}`);
  }

  return data;
}

/**
 * Create or updates a medicine batch entry.
 */
export async function upsertMedicineBatch(values: MedicineBatchInsert): Promise<MedicineBatchRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_batches")
    .upsert(
      {
        id: values.id,
        medicine_id: values.medicine_id,
        health_center_id: values.health_center_id,
        batch_number: values.batch_number.trim(),
        quantity: values.quantity ?? 0,
        unit: values.unit?.trim() || "pcs",
        expiry_date: values.expiry_date,
        status: values.status || "active",
        created_by: values.created_by,
      },
      {
        onConflict: "medicine_id,health_center_id,batch_number",
      }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to upsert medicine batch: ${error.message}`);
  }

  return data;
}

/**
 * Increment the stock quantity of an existing batch.
 */
export async function incrementBatchQuantity(
  batchId: string,
  quantityToAdd: number
): Promise<MedicineBatchRow> {
  const supabase = await createClient();
  
  // First get current quantity
  const { data: current, error: fetchError } = await supabase
    .from("medicine_batches")
    .select("quantity")
    .eq("id", batchId)
    .single();

  if (fetchError || !current) {
    throw new Error(`Unable to fetch batch to increment quantity: ${fetchError?.message || "Batch not found"}`);
  }

  const newQuantity = current.quantity + quantityToAdd;

  const { data, error } = await supabase
    .from("medicine_batches")
    .update({ quantity: newQuantity })
    .eq("id", batchId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to increment batch stock: ${error.message}`);
  }

  return data;
}

/**
 * Modify batch attributes (like stock counts, unit name, or batch status).
 */
export async function updateMedicineBatch(
  batchId: string,
  values: MedicineBatchUpdate
): Promise<MedicineBatchRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medicine_batches")
    .update(values)
    .eq("id", batchId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to update medicine batch: ${error.message}`);
  }

  return data;
}

/**
 * Hard delete a medicine batch from the center cabinet.
 */
export async function deleteMedicineBatch(batchId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("medicine_batches").delete().eq("id", batchId);

  if (error) {
    throw new Error(`Unable to delete medicine batch: ${error.message}`);
  }
}
