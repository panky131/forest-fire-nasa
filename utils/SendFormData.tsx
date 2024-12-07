interface FunctionPropType {
  url: string,
  data: FormData
}

const sendFormData = async ({ url, data }: FunctionPropType): Promise<boolean> => {

  console.log(data);
  console.log(url)

  return true;
}


export { sendFormData };