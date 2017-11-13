import node from "rollup-plugin-node-resolve";

export default {
  entry: "d3.imports.js",
  format: "umd",
  moduleName: "d3",
  plugins: [node()],
  dest: "d3.js"
};
