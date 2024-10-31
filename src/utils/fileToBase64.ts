export const FileToBase64 = (file: any)=> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      let fileResult = "" as string;
      reader.readAsDataURL(file);
      reader.onload = () => {
        fileResult = String(reader.result);
      };
      reader.onerror = (error: any) => {
        reject(error);
      };
      reader.onloadend = () => {
        resolve(fileResult);
      };
    });
  }