import instance from "@/utils/axios.utils";

const lead = {
  list: (page, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `leads/?page=${page}`;
      if (body?.group) {
        url += `&group=${encodeURIComponent(body.group)}`;
      }
       if (body?.search) {
        url += `&search=${encodeURIComponent(body.search)}`;
      }

      if (body?.created_by) {
        url += `&created_by=${encodeURIComponent(body.created_by)}`;
      }

      if (body?.assigned_to) {
        url += `&assigned_to=${encodeURIComponent(body.assigned_to)}`;
      }

      if (body?.status) {
        url += `&status=${encodeURIComponent(body.status)}`;
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
      let url = `leads/`;
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
      let url = `leads/${id}/`;

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
      let url = `leads/${id}/`;

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
      let url = `leads/${id}/`;
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

  logList: (leadId, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `lead-logs/?lead=${leadId}`;
      if (body?.group) {
        url += `&group=${encodeURIComponent(body.group)}`;
      }
       if (body?.search) {
        url += `&search=${encodeURIComponent(body.search)}`;
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
};

export default lead;
