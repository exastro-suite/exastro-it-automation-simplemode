import { createRouter, createWebHistory } from "vue-router";
import { useStore } from "../store";
import { getCookie,setCookieForWelcomePage} from "../utils/cookie";
const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../view/login/Login.vue"),
  },
  {
    path: "/",
    component: () => import("../view/layout/index.vue"),
    redirect: "/setting/devicelist",
    children: [
      {
        path: "/job",
        name: "Job",
        component: () => import("../view/job/job.vue"),
        meta: {
          title: "ジョブ実行",
          keepAlive: true,
        },
      },
      {
        path: "/setting",
        meta: {
          title: "設定",
        },
        redirect: "/setting/devicelist",
        children: [
          {
            path: "/setting/devicelist",
            component: () => import("../view/setting/deviceList.vue"),
            meta: {
              title: "機器一覧",
            },
          },

          {
            path: "/setting/joblist",
            component: () => import("../view/setting/jobList.vue"),
            meta: {
              title: "ジョブ一覧",
            },
          },
        ],
      },

      {
        path: "/confirm",
        component: () => import("../view/confirm/index.vue"),
        meta: {
          title: "実行状況確認",
        },
      },
      {
        path: "/parameter",
        component: () => import("../view/parameter/index.vue"),
        meta: {
          title: "パラメータシート",
         
        },
        
      },
      {
        path: "/comparison",
        name: "Comparison",
        component: () => import("../view/comparison/comparJob.vue"),
        meta: {
          title: "比較実行",
          keepAlive: true,
        },
      },
      {
        path: "/link",
        component: () => import("../view/link/index.vue"),
        meta: {
          title: "ITA Link",
        },
      },
    ],
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
  
});
// Route guard
router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next();
  const tokenStr = window.localStorage.getItem("token");

  if (!tokenStr) return next("/login");
  next();
});
// Disable browser fallback
router.afterEach((to, from) => {
  if (from.path == "/login" && getCookie("welcome") == '1') {
    setCookieForWelcomePage("welcome", '1');
  }
  useStore().setWelcomeDialogShow((getCookie("welcome") != '1') && from.path == "/login")
  history.pushState(null, '', location.protocol + '//' + location.host + to.path)
})
export default router;
