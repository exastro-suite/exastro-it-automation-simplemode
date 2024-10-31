import axios from "axios";
import { useStore } from "../store";
import { loginApi } from "../api/index";
import { ElMessage } from "element-plus";
// import { useRouter } from "vue-router";
import router from "../router";
const store = useStore();
const service = axios.create({
  baseURL: "/",
  timeout: 450 * 1000,

  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});
// request
service.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  if (localStorage.getItem("token")) {
    const token_type = "Bearer";
    config.headers.Authorization =
      token_type + " " + localStorage.getItem("token");
  }
  if (localStorage.getItem("italink")) {
   

    config.headers["X-ITA-HOST"] = localStorage.getItem("italink");
  }
  return config;
});
// response

service.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
   

    if (error.response) {
     
      if (error.response.status) {
       
        if (error.response.status == "401") {
          if (error.response.data.result == "401-00002") {
            let refreshToken = localStorage.getItem("refresh_token");
            let organization = localStorage.getItem("organization");

            if (refreshToken) {
              loginApi({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: "_" + organization + "-api",
              })
                .then((res) => {
                  const tokendata = res;
                  

                  if (res) {
                    
                    const { access_token, refresh_token } = tokendata.data;
                    store.setToken(access_token);
                    store.setRefreshToken(refresh_token);
                    localStorage.setItem("token", access_token);
                    localStorage.setItem("refresh_token", refresh_token);
                    window.location.reload();
                  }
                })
                .catch((error) => {
                  store.$reset();
                  router.push({
                    path: "/login",
                  });
                });
            } else {
              store.$reset();
              // go to login
              router.push({
                path: "/login",
              });
            }
          } else {
            
            if (error.response.data.error_description) {
              return Promise.reject(error.response.data.error_description);
            }else if (error.response.data.error) {
              return Promise.reject(error.response.data.error);
            }
            
            if (error.response.data.message) {
              

              return Promise.reject(error.response.data.message);
            } else {
              return Promise.reject(error.response.statusText);
            }
          }
        } else {
          if (error.response.data.error) {
            return Promise.reject(error.response.data.error);
          }
      
          if (error.response.data.message) {
            return Promise.reject(error.response.data.message);
          } else {
            return Promise.reject(error.response.statusText);
          }
        }
      } else {
       
        ElMessage({
          type: "error",
          message: error.message,
        });
        return Promise.reject(error.message);
      }
    } else {
      

      // "timeout of 5000ms exceeded"
      ElMessage({
        type: "error",
        message: error.message,
      });
      store.$reset();
      router.push({
        path: "/login",
      });
    }
  }
);
// export
export default service;
