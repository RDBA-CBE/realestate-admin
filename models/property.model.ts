import instance from "@/utils/axios.utils";

const properties = {
  list: (page, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `properties?page=${page}`;

      if (body?.is_approved == "No") {
        url += `&is_approved=${encodeURIComponent(false)}`;
      }

      if (body?.is_approved == "Yes") {
        url += `&is_approved=${encodeURIComponent(true)}`;
      }
      if (body?.pagination == "No") {
        url += `&pagination=${encodeURIComponent(false)}`;
      }
      if (body?.pagination == "Yes") {
        url += `&pagination=${encodeURIComponent(true)}`;
      }

      if (body?.publish == "Yes") {
        url += `&publish=${encodeURIComponent(true)}`;
      }

      if (body?.publish == "No") {
        url += `&publish=${encodeURIComponent(false)}`;
      }

      if (body?.group) {
        url += `&group=${body?.group}`;
      }

      if (body?.userId) {
        url += `&created_by=${body?.userId}`;
      }

      if (body?.assigned_to_developer) {
        url += `&assigned_to_developer=${encodeURIComponent(
          body?.assigned_to_developer,
        )}`;
      }

      if (body?.assigned_to_agent) {
        url += `&assigned_to_agent=${encodeURIComponent(
          body?.assigned_to_agent,
        )}`;
      }

      if (body?.created_by) {
        url += `&created_by=${encodeURIComponent(body?.created_by)}`;
      }

      if (body?.assigned_to) {
        url += `&assigned_to=${encodeURIComponent(body?.assigned_to)}`;
      }

      if (body?.search) {
        url += `&search=${body?.search}`;
      }

      if (body?.property_type) {
        url += `&property_type=${body?.property_type}`;
      }

      if (body?.listing_type) {
        url += `&listing_type=${body?.listing_type}`;
      }

      if (body?.status) {
        url += `&status=${body?.status}`;
      }

      if (body?.developer) {
        url += `&developer=${body?.developer}`;
      }

      if (body?.agent) {
        url += `&agent=${body?.agent}`;
      }

      if (body?.project) {
        url += `&project=${body?.project}`;
      }

      if (body?.ordering) {
        url += `&sort_by=${body?.ordering}`;
      }

      if (body?.team == true) {
        url += `&team=${encodeURIComponent(body.team)}`;
      }
      if (body?.team == false) {
        url += `&team=${encodeURIComponent(body.team)}`;
      }

      if (body?.is_approved == true) {
        url += `&is_approved=${encodeURIComponent(body.is_approved)}`;
      }
      if (body?.is_approved == false) {
        url += `&is_approved=${encodeURIComponent(body.is_approved)}`;
      }

      instance()
        .get(url, body)
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
      let url = `properties/`;
      const config = {
        headers: {
          "Content-Type": "multipart/form-data; charset=utf-8;",
        },
      };
      instance()
        .post(url, data, config)
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          console.log("✌️error --->", error);
          if (error.response?.data) {
            reject(error.response.data);
          } else if (error.response) {
            reject(error.response.data.message);
          } else {
            reject(error);
          }
        });
    });
    return promise;
  },

  update: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      let url = `properties/${id}/`;
      const config = {
        headers: {
          "Content-Type": "multipart/form-data; charset=utf-8;",
        },
      };
      instance()
        .patch(url, data, config)
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
      let url = `properties/${id}/`;

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
      let url = `properties/${id}/`;

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

  count: (body: any) => {
    let url = "properties/counts";
    const params: any = new URLSearchParams();

    if (body?.userId) {
      params.append("created_by", body.userId);
    }

    if (body?.publish === "Yes") {
      params.append("publish", true);
    }
    if (body?.project) {
      params.append("project", body.project);
    }

    if (body?.developer) {
      params.append("developer", body.developer);
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

export default properties;
