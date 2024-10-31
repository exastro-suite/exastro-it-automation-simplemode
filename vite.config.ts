
import vue from '@vitejs/plugin-vue'

// vite.config.ts
import { defineConfig ,loadEnv} from 'vite'


import postCssPxToRem from "postcss-pxtorem";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default (({ mode }) => {

  const VITE_APP_SERVER_URL: string = loadEnv(mode, process.cwd()).VITE_BASE_URL;

  return defineConfig({
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      
      postCssPxToRem({
        rootValue: 192, 
        propList: ["*", "!border"], 
        selectorBlackList: [".el-"], 
      }),
    ]
  })
})






