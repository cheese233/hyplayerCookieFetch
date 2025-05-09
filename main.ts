import { parseArgs } from "jsr:@std/cli/parse-args";
import * as fs from "jsr:@std/fs";
import { Aes } from "https://deno.land/x/crypto/aes.ts";
import { Ecb, Padding } from "https://deno.land/x/crypto/block-modes.ts";
import { decodeHex } from "jsr:@std/encoding/hex";
function decodeEApi(data: string) {
  const key = new TextEncoder().encode("e82ckenh8dichen8");
  const decipher = new Ecb(Aes, key, Padding.PKCS7); // We don't need to cryptographic-safe
  return new TextDecoder().decode(decipher.decrypt(decodeHex(data)));
}
const HARpath = parseArgs(Deno.args, {
  string: ["har"],
}).har;
if (!HARpath || !(await fs.exists(HARpath)))
  throw "Please specific a vaild har path";
interface HarValue {
  log: {
    entries: {
      request: {
        url: string;
        headers: any[];
        cookies: any[];
        postData: { params: any[] };
      };
    }[];
  };
}
const output = {
    Cookies: {},
    Headers: {},
    EApiHeaders: {},
    DataTokens: {},
  },
  HAR: HarValue = JSON.parse(
    new TextDecoder().decode(await Deno.readFile(HARpath))
  );
for (const req of HAR.log.entries)
  if (req.request.url.includes("interface.music.163.com/eapi/v1")) {
    const expand = (val: any[]) => {
      const result: any = {};
      val.forEach((v) => (result[v.name] = v.value));
      return result;
    };
    output.Cookies = expand(req.request.cookies);
    output.Headers = expand(
      req.request.headers.filter(
        (val) =>
          !["content-length", "cookie", "accept", "content-type"].includes(
            val.name
          ) && val.name[0] != ":"
      )
    );
    output.EApiHeaders = JSON.parse(
      JSON.parse(
        decodeEApi(
          req.request.postData.params.find((ele) => ele.name == "params").value
        ).split("-36cd479b6b5-")[1]
      ).header
    );
    console.log(JSON.stringify(output));
    Deno.exit(0);
  }

throw "No data found, ensure you had visited several pages in NeteaseCloudMusic!";
