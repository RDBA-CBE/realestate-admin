import instance from "@/utils/axios.utils";

const user = {
  list: (page, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/?page=${page}`;
      if (body?.group) {
        url += `&group=${encodeURIComponent(body.group)}`;
      }


      if (body?.developer_property_users) {
        url += `&developer_property_users=${encodeURIComponent(body.developer_property_users)}`;
      }

      if (body?.user_type) {
        url += `&user_type=${encodeURIComponent(body.user_type)}`;
      }
      if (body?.search) {
        url += `&search=${encodeURIComponent(body.search)}`;
      }

      if (body?.account_status) {
        url += `&account_status=${encodeURIComponent(body?.account_status)}`;
      }

      if (body?.ordering) {
        url += `&sort_by=${body?.ordering}`;
      }
      
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  create: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/`;
      instance()
        .post(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  update: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/${id}/`;

      instance()
        .patch(url, data)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  delete: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/${id}/`;

      instance()
        .delete(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  details: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `users/${id}/`;
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  groups: () => {
    let promise = new Promise((resolve, reject) => {
      let url = `groups/`;
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  uploadFile: (file: any) => {
    let promise = new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      let url = "/hdd/upload_file";
      const config = {
        headers: {
          "Content-Type": "multipart/form-data; charset=utf-8;",
        },
      };
      instance()
        .post(url, formData, config)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.data.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  group: (page) => {
    let promise = new Promise((resolve, reject) => {
      let url = `groups/?page=${page}`;
     
      instance()
        .get(url)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            reject(error.response.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  wishlist: (userId: any) => {
    return instance()
      .get(`wishlists/?user=${userId}`)
      .then((res) => res.data)
      .catch((error) => Promise.reject(error.response?.data || error));
  },

  enquiries: (userId: any) => {
    return instance()
      .get(`leads/?created_by=${userId}`)
      .then((res) => res.data)
      .catch((error) => Promise.reject(error.response?.data || error));
  },

  count: (body: any) => {
      let url = "users/counts";
      const params: any = new URLSearchParams();
  
      if (body?.account_status) {
        params.append("account_status", body.account_status);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
  
      return instance()
        .get(url)
        .then((res) => res.data)
        .catch((error) => {
          if (error.response) {
            return Promise.reject(error.response.message);
          }
          return Promise.reject(error);
        });
    },
  

};

export default user;
