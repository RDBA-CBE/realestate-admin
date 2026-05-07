import instance from "@/utils/axios.utils";

const employmentType = {
  list: (page, body) => {
    let promise = new Promise((resolve, reject) => {
      let url = `employment-types/?page=${page}`;
      if (body?.search) url += `&search=${encodeURIComponent(body.search)}`;
      if (body?.pagination == "No") url += `&pagination=${false}`;
      instance()
        .get(url)
        .then((res) => resolve(res.data))
        .catch((error) => {
          if (error.response) reject(error.response.message);
          else reject(error);
        });
    });
    return promise;
  },

  create: (data: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .post(`employment-types/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => {
          if (error.response) reject(error.response.data);
          else reject(error);
        });
    });
    return promise;
  },

  update: (data: any, id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .patch(`employment-types/${id}/`, data)
        .then((res) => resolve(res.data))
        .catch((error) => {
          if (error.response) reject(error.response.data);
          else reject(error);
        });
    });
    return promise;
  },

  delete: (id: any) => {
    let promise = new Promise((resolve, reject) => {
      instance()
        .delete(`employment-types/${id}/`)
        .then((res) => resolve(res.data))
        .catch((error) => {
          if (error.response) reject(error.response.data);
          else reject(error);
        });
    });
    return promise;
  },
};

export default employmentType;
