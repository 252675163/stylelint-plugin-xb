const { lint } = require("stylelint");
const mutil = require("../libs/util")
const ruleName = `${mutil.PLUGIN_PREFIX}/primary-color`

const config = {
  plugins: ["./index.js"],
  rules: {
    [ruleName]: [
      2,
      {color:[{hex:'007aff',rgb:'0,122,255',vname:'@primary-color'}]}
    ]
  }
};
  it("PrimaryColor/hexErr", async () => {
    const  res= await lint({
      code:`
      .test {
          color: #007aff;
          background: #007aff;
          border-bottom: 1px solid #007aff;
          border-top: 1px solid #007AfF;
          border-left: 1px solid #000;
      }
      `,
      config
     
    });
    const warnings = res.results[0].warnings
    expect(warnings).toHaveLength(4);
    expect(warnings[0].line).toBe(3);
    expect(warnings[1].line).toBe(4);
    expect(warnings[2].line).toBe(5);
    expect(warnings[3].line).toBe(6);
    expect(warnings[0].text).toBe('颜色请使用变量@primary-color替换 (xb-style/primary-color)');
  });
  it("PrimaryColor/RGBErr", async () => {
    const  res= await lint({
      code:`
      .test {
          color: rgba(0,122,255,.2);
          background: rgb(0,122,255);
          border-bottom: 1px solid rgba(0,122,255,0.3);
          border-top: 1px solid rgb(0,122,255);
          border-left: 1px solid #000;
      }
      `,
      config
    });
    const warnings = res.results[0].warnings
    expect(warnings).toHaveLength(4);
    expect(warnings[0].line).toBe(3);
    expect(warnings[1].line).toBe(4);
    expect(warnings[2].line).toBe(5);
    expect(warnings[3].line).toBe(6);
    expect(warnings[0].text).toBe('颜色请使用变量@primary-color替换 (xb-style/primary-color)');
  });
  it("PrimaryColor/correctValue", async () => {
    const  res= await lint({
      code:`
      .test {
          color: red;
          background: rgb(0,122,215);
          border-bottom: 1px solid rgba(0,122,15,0.3);
          border-top: #333;
          border-left: 1px solid #000;
      }
      `,
      config
    });
    const warnings = res.results[0].warnings
    expect(warnings).toHaveLength(0);
  });

  it("PrimaryColor/fix", async () => {
    const  res= await lint({
      code:"\
.test {\
  color: rgba(0,122,255,.2);\
  background: rgb(0,122,255);\
  border-bottom: 1px solid #007aff;\
  border-top: 1px solid #007AfF;\
}",
      config,
      fix:true
    });
    expect(res.output).toBe("\
.test {\
  color: @primary-color;\
  background: @primary-color;\
  border-bottom: 1px solid @primary-color;\
  border-top: 1px solid @primary-color;\
}");
  });

  it("PrimaryColor/inline", async () => {
    const  res= await lint({
      code:`
      <a style="background: #007aff;border-bottom: 1px solid red;"></a>
      `,
      config
    });
    const warnings = res.results[0].warnings
    expect(warnings).toHaveLength(1);
    expect(warnings[0].text).toBe("系统主题色请不要直接使用，请用添加class或其他方式处理 (xb-style/primary-color)")
  });