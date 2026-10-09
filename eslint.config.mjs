// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  { ignores: ["public/**", "scripts/**"] },
  { files: ["app/components/**/*.vue"], rules: { "vue/multi-word-component-names": "off" } },
);
