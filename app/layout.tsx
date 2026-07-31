import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { headers } from "next/headers";
import { withBasePath } from "../config/base-path";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

function firstHeaderValue(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

function isUpstreamChatgptSiteHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  return hostname === "chatgpt.site" || hostname.endsWith(".chatgpt.site");
}

/**
 * Prefer the visitor-facing reverse-proxy host. Never publish the upstream
 * chatgpt.site hostname in social or icon metadata.
 */
function resolvePublicMetadataHost(requestHeaders: Headers): string | null {
  const candidates = [
    firstHeaderValue(requestHeaders.get("x-forwarded-host")),
    firstHeaderValue(requestHeaders.get("host")),
  ];

  for (const candidate of candidates) {
    if (candidate && !isUpstreamChatgptSiteHost(candidate)) {
      return candidate;
    }
  }

  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const publicHost = resolvePublicMetadataHost(requestHeaders);
  const title = "Fieldwork — AI Adoption Workshop Kit";
  const description =
    "A fictional, interactive 45-minute workshop for practicing safer AI-enabled People and operations workflows.";
  const socialImagePath = withBasePath("/og.png");
  const imageAlt = "AI Adoption, in Practice — a 45-minute workshop kit";

  const shared = {
    title,
    description,
    icons: {
      icon: socialImagePath,
      shortcut: socialImagePath,
    },
  } as const;

  // Without a visitor-facing host, keep branded relative paths so reverse
  // proxies never leak the upstream chatgpt.site origin into previews.
  if (!publicHost) {
    return {
      ...shared,
      openGraph: {
        title,
        description,
        type: "website",
        images: [
          {
            url: socialImagePath,
            width: 1731,
            height: 909,
            alt: imageAlt,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [socialImagePath],
      },
    };
  }

  const protocol =
    firstHeaderValue(requestHeaders.get("x-forwarded-proto")) ??
    (publicHost.startsWith("localhost") || publicHost.startsWith("127.")
      ? "http"
      : "https");
  const metadataBase = new URL(`${protocol}://${publicHost}`);
  const socialImage = new URL(socialImagePath, metadataBase).toString();

  return {
    ...shared,
    metadataBase,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: socialImage,
          width: 1731,
          height: 909,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
