import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(160deg, rgb(15, 23, 42) 0%, rgb(37, 99, 235) 58%, rgb(13, 148, 136) 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 368,
            height: 368,
            borderRadius: 92,
            background: "rgba(255,255,255,0.12)",
            border: "18px solid rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 28px 80px rgba(15, 23, 42, 0.28)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
            }}
          >
            <div
              style={{
                fontSize: 176,
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: -8,
              }}
            >
              G
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: 6,
              }}
            >
              GAMOT
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
