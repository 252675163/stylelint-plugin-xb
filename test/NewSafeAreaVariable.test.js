const { lint } = require("stylelint");
const mutil = require("../libs/util")
const ruleName = `${mutil.PLUGIN_PREFIX}/new-safe-area-variable`

const config = {
  plugins: ["./index.js"],
  rules: {
    [ruleName]: [
      2
    ]
  },
  fix:true
};
it("SafeAreaVariable/ok", async () => {
  const  res= await lint({
    code:`
    .test {
      top: calc(100vh - 120px - var(--safe-area-inset-bottom));
    }
    `,
    config
  });
  const warnings = res.results[0].warnings
  expect(warnings.length).toBe(0);
});
  it("SafeAreaVariable/single1", async () => {
    const  res= await lint({
      code:`
      .test {
        top: calc(100vh - 120px - constant(safe-area-inset-bottom));
      }
      `,
      config
    });
    const warnings = res.results[0].warnings
    expect(warnings[0].text).toBe('利用var来代替使用env和constant属性');
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
    expect(warnings[0].text).toBe('利用var来代替使用env和constant属性');
  });
  it("SafeAreaVariable/two-err-fix", async () => {
    const  res= await lint({
      code:`
      .test {
        top: constant(safe-area-inset-top);
        top: env(safe-area-inset-top);
      }
      `,
      config,
      fix:true
    });
    expect(res.output).toBe('\n      .test {\n        top: var(--safe-area-inset-top);\n        top: var(--safe-area-inset-top);\n      }\n      ')
  });
  it("SafeAreaVariable/two-err", async () => {
    const  res= await lint({
      code:`
      .test {
        top: constant(safe-area-inset-top);
        top: env(safe-area-inset-top);
      }
      `,
      config,
    });
    const warnings = res.results[0].warnings
    expect(warnings.length).toBe(2);
    expect(warnings[0].text).toBe('利用var来代替使用env和constant属性');
    expect(warnings[1].text).toBe('利用var来代替使用env和constant属性');
  });
  //  it("SafeAreaVariable/order", async () => {
  //    const  res= await lint({
  //      code:`
  //      .test {
  //        top: env(safe-area-inset-top);
  //        top: var(--safe-area-inset-top);
  //      }
  //      `,
  //      config,
  //      fix:true
  //    });
  //    expect(res.output).toBe('\n      .test {\n        top: var(--safe-area-inset-top);\n      }\n      ')
  //  });
  // it("SafeAreaVariable/orde2r", async () => {
  //   const  res= await lint({
  //     code:`
  //     .message-list-tabs {
  //       .van-cell::after {
  //         height: calc(100vh - 120px - constant(safe-area-inset-bottom));
  //         height: calc(100vh - 120px - env(safe-area-inset-bottom));
  //       }
  //     }
  //     `,
  //     config,
  //     fix:true
  //   });
  //   expect(res.output).toBe('\n      .test {\n        top: var(--safe-area-inset-top);\n      }\n      ')
  // });