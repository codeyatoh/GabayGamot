import Link from "next/link";
import type { SVGProps } from "react";

import { login } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const message = Array.isArray(params.message)
    ? params.message[0]
    : params.message;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#0F172A]">
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#101B2D] px-8 py-10 shadow-xl dark:shadow-2xl">
        {/* ── Patterned Grid Overlay ── */}
        <div
          className="absolute inset-0 -top-px -left-px z-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, color-mix(in srgb, var(--card-foreground, #0f172a) 8%, transparent) 1px, transparent 1px),
              linear-gradient(to bottom, color-mix(in srgb, var(--card-foreground, #0f172a) 8%, transparent) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            maskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              radial-gradient(ellipse 70% 50% at 50% 0%, #000 60%, transparent 100%)
            `,
            WebkitMaskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              radial-gradient(ellipse 70% 50% at 50% 0%, #000 60%, transparent 100%)
            `,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />

        <div className="relative isolate flex flex-col items-center">
          <Logo className="size-11 text-[#2563EB] dark:text-[#60A5FA]" />
          <p className="mt-4 font-bold text-xl text-slate-900 dark:text-slate-50 tracking-tight">
            Log in to GabayGamot
          </p>
          <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">
            AI-assisted medicine management for barangay health centers
          </p>

          {message && (
            <div className="mt-5 w-full rounded-xl border border-blue-200 bg-[#EFF6FF] px-4 py-3 text-xs font-medium text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/15 dark:text-blue-300">
              {message}
            </div>
          )}

          <form className="mt-6 w-full space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 underline"
                  href="#"
                >
                  Forgot your password?
                </Link>
              </div>
              <input
                className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
                id="password"
                minLength={6}
                name="password"
                placeholder="Password"
                required
                type="password"
              />
            </div>

            <Button
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl mt-2 font-semibold shadow-sm"
              formAction={login}
              size="lg"
              type="submit"
            >
              Continue with Email
            </Button>
          </form>

          <div className="my-6 flex w-full items-center justify-center overflow-hidden gap-3">
            <div className="h-px flex-1 bg-slate-200/60 dark:bg-slate-800" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-200/60 dark:bg-slate-800" />
          </div>

          <Button
            asChild
            className="w-full border-slate-200 dark:border-slate-800 dark:text-slate-300 rounded-xl"
            size="lg"
            variant="outline"
          >
            <Link href="/signup">Create BHW Account</Link>
          </Button>

          <div className="mt-6 text-center">
            <Link
              className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
              href="/"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Logo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="currentColor"
      height="200"
      viewBox="0 0 200 200"
      width="200"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_1113_5014)">
        <path d="M168.89 31.1101C159.969 21.5141 149.206 13.8146 137.243 8.4716C125.28 3.12858 112.363 0.251692 99.2637 0.0127915C86.1641 -0.226109 73.1507 2.17789 61.001 7.08116C48.8513 11.9844 37.8146 19.2864 28.5503 28.5507C19.2859 37.8151 11.9839 48.8518 7.08067 61.0015C2.1774 73.1512 -0.226597 86.1646 0.0123033 99.2642C0.251203 112.364 3.1281 125.281 8.47111 137.244C13.8141 149.207 21.5136 159.97 31.1096 168.89C40.0301 178.486 50.7932 186.186 62.756 191.529C74.7189 196.872 87.6359 199.749 100.736 199.987C113.835 200.226 126.849 197.822 138.998 192.919C151.148 188.016 162.185 180.714 171.449 171.45C180.713 162.185 188.015 151.148 192.919 138.999C197.822 126.849 200.226 113.836 199.987 100.736C199.748 87.6364 196.871 74.7193 191.528 62.7565C186.185 50.7937 178.486 40.0306 168.89 31.1101ZM1.49965 97.5001C1.50727 80.0254 6.28449 62.8842 15.3163 47.9245C24.3481 32.9648 37.2918 20.7541 52.7521 12.6088C68.2124 4.46343 85.6027 0.692494 103.048 1.70249C120.494 2.71248 137.333 8.4651 151.75 18.3401C136.818 9.57797 119.813 4.97194 102.5 5.00014H98.9996C85.5712 4.99313 72.312 7.99717 60.1978 13.7912C48.0836 19.5853 37.4227 28.0218 28.9996 38.4801C15.5955 53.8715 7.35712 73.0798 5.44476 93.4C3.53241 113.72 8.04243 134.128 18.3396 151.75C7.35031 135.795 1.47677 116.874 1.49965 97.5001ZM87.7197 181.59C75.8751 180.407 64.4235 176.691 54.1418 170.693C43.8601 164.694 34.9889 156.555 28.13 146.826C21.2712 137.097 16.5852 126.007 14.39 114.308C12.1948 102.608 12.5417 90.5736 15.4072 79.0202C18.2728 67.4668 23.5899 56.6649 30.9978 47.3474C38.4057 38.0299 47.731 30.4148 58.3412 25.0188C68.9514 19.6228 80.5981 16.572 92.4911 16.0736C104.384 15.5752 116.245 17.6408 127.27 22.1301C116.428 18.3302 104.912 16.8361 93.4598 17.7437C82.0073 18.6512 70.8706 21.9404 60.7628 27.4006C50.6549 32.8607 41.7987 40.3715 34.7612 49.452C27.7237 58.5325 22.66 68.9826 19.8944 80.1331C17.1288 91.2836 16.7222 102.889 18.7007 114.205C20.6792 125.522 24.9992 136.301 31.384 145.852C37.7687 155.402 46.0776 163.515 55.7786 169.669C65.4796 175.823 76.3588 179.883 87.7197 181.59ZM99.9996 73.7301C128.08 27.4001 201.45 96.1901 99.9996 151.53C-1.45035 96.1901 71.9196 27.4001 99.9996 73.7301ZM131 176.46C143.047 171.577 153.77 163.915 162.294 154.1C170.818 144.285 176.901 132.594 180.048 119.981C183.195 107.368 183.316 94.1893 180.402 81.5204C177.488 68.8515 171.621 57.0507 163.28 47.0801C151.945 32.3368 136.085 21.7208 118.134 16.8616C100.184 12.0025 81.1341 13.1687 63.9102 20.1814C46.6863 27.194 32.2398 39.6655 22.7883 55.6814C13.3368 71.6973 9.40259 90.3724 11.5896 108.84C9.65527 96.6398 10.3014 84.1693 13.4863 72.2342C16.6712 60.2991 22.324 49.1647 30.0796 39.5501C38.8869 29.402 49.7301 21.2196 61.9051 15.5344C74.0801 9.84913 87.3148 6.78813 100.75 6.55014C123.096 6.98528 144.45 15.8593 160.523 31.39C176.596 46.9206 186.197 67.9575 187.399 90.2756C188.6 112.594 181.313 134.54 167 151.706C152.688 168.873 132.41 179.988 110.24 182.82C117.404 181.602 124.382 179.464 131 176.46ZM32.1996 167.8C19.5769 154.243 11.1518 137.32 7.94319 119.076C4.73459 100.833 6.87988 82.0503 14.1196 65.0001C8.21457 81.7197 7.37989 99.811 11.7204 117.003C16.0609 134.195 25.3831 149.722 38.5169 161.635C51.6508 173.548 68.0109 181.316 85.5438 183.963C103.077 186.611 121.001 184.021 137.067 176.517C153.133 169.014 166.624 156.932 175.848 141.788C185.071 126.644 189.616 109.113 188.911 91.3952C188.206 73.6776 182.284 56.5629 171.886 42.1994C161.489 27.8359 147.081 16.8637 130.47 10.6601C144.385 14.918 157.15 22.2836 167.8 32.2001C184.692 50.3981 193.873 74.4361 193.411 99.2617C192.949 124.087 182.882 147.767 165.324 165.325C147.767 182.882 124.087 192.95 99.2612 193.411C74.4356 193.873 50.3976 184.693 32.1996 167.8ZM102.5 198.5C83.1263 198.523 64.2047 192.649 48.2496 181.66C66.8611 192.543 88.5543 196.952 109.937 194.197C131.32 191.442 151.188 181.678 166.433 166.433C181.678 151.188 191.441 131.321 194.196 109.938C196.951 88.5548 192.543 66.8616 181.66 48.2501C191.535 62.6671 197.287 79.5061 198.297 96.9516C199.307 114.397 195.536 131.787 187.391 147.248C179.246 162.708 167.035 175.652 152.075 184.684C137.116 193.715 119.974 198.493 102.5 198.5Z" />
      </g>
      <defs>
        <clipPath id="clip0_1113_5014">
          <rect height="200" width="200" />
        </clipPath>
      </defs>
    </svg>
  );
};
