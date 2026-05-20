import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
            "linear-gradient(160deg, rgb(15, 23, 42) 0%, rgb(37, 99, 235) 60%, rgb(13, 148, 136) 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 36,
            background: "rgba(255,255,255,0.14)",
            border: "8px solid rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -4,
          }}
        >
          G
        </div>
      </div>
    ),
    size,
  );
}
