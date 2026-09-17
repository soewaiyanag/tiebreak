import app from "./app.js";
//                    ^^^ ESM-on-Node quirk: the import specifier points at the
// *emitted* .js path even though the source is app.ts. `tsc` and `tsx` both
// resolve it back to app.ts. You get used to it.

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`@tiebreak/server -> http://localhost:${port}`);
});
