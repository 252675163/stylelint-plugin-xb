const { lint } = require("stylelint");
const mutil = require("../libs/util")
const ruleName = `${mutil.PLUGIN_PREFIX}/safe-area-variable`

const config = {
  plugins: ["./index.js"],
  rules: {
    [ruleName]: [
      2,
      {}
    ]
  }
};
  it("SafeAreaVariable/single1", async () => {
    const  res= await lint({
      code:`
      .test {
        top: constant(safe-area-inset-top);
      }
      `,
      config
    });
    const warnings = res.results[0].warnings
    expect(warnings[0].text).toBe('constant和env需要联用');
  });
  it("SafeAreaVariable/single2", async () => {
    const  res= await lint({
      code:`
      .test {
        top: env(safe-area-inset-top);
      }
      `,
      config
    });
    const warnings = res.results[0].warnings
    expect(warnings[0].text).toBe('constant和env需要联用');
  });
  it("SafeAreaVariable/order-fix", async () => {
    const  res= await lint({
      code:`.test {top: env(safe-area-inset-top);top: constant(safe-area-inset-top);}`,
      config,
      fix:true
    });
    expect(res.output).toBe(`.test {top: constant(safe-area-inset-top);top: env(safe-area-inset-top);}`);
  });
  it("SafeAreaVariable/order", async () => {
    const  res= await lint({
      code:`
      .test {
        top: env(safe-area-inset-top);
        top: constant(safe-area-inset-top);
      }
      `,
      config,
    });
    const warnings = res.results[0].warnings
    expect(warnings[0].text).toBe('env需要在constant下方');
    expect(warnings[1].text).toBe('env需要在constant下方');
  });
  