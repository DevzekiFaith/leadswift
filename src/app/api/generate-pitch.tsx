import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { leadId, userId, prompt } = req.body;
  // TODO: call OpenAI / GPT-5 with `prompt` and return generated text.
  // For now, return a placeholder:
  const generated = `Hello ${leadId}, this is a demo pitch. Replace with OpenAI integration.`;

  // store pitch record in supabase
  await supabase.from("pitches").insert([{ lead_id: leadId, user_id: userId, prompt_used: prompt, generated_text: generated }]);

  return res.status(200).json({ text: generated });
}
