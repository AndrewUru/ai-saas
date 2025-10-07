// app/api/integrations/woo/route.ts
import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { z } from "zod";

const Body = z.object({
  site_url: z.string().url(),
  ck: z.string().min(10),
  cs: z.string().min(10),
  integration_id: z.string().uuid().optional(), // si editas
});

export async function POST(req: Request) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ ok: false, error: "No auth" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { ok: false, error: "Payload inválido" },
      { status: 400 }
    );

  const { site_url, ck, cs, integration_id } = parsed.data;
  const ck_cipher = Buffer.from(encrypt(ck), "utf8");
  const cs_cipher = Buffer.from(encrypt(cs), "utf8");

  if (integration_id) {
    const { error } = await supabase
      .from("integrations_woocommerce")
      .update({
        site_url,
        ck_cipher,
        cs_cipher,
        updated_at: new Date().toISOString(),
      })
      .eq("id", integration_id)
      .eq("user_id", user.id);
    if (error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
  } else {
    const { error } = await supabase
      .from("integrations_woocommerce")
      .insert({ user_id: user.id, site_url, ck_cipher, cs_cipher });
    if (error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
  }
  return NextResponse.json({ ok: true });
}
