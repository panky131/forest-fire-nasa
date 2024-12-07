interface FunctionPropType {
  url: string,
  data: FormData
}

const sendFormData = async ({ url, data }: FunctionPropType): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: data,
    });

    const responseJSON = await response.json();
    if (responseJSON.status !== 'success') {
      return false;
    }

    return true;
  } catch (error) {

    console.log(error);
    return false;

  }
}


export { sendFormData };