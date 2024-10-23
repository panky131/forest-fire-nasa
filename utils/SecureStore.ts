import * as SecureStore from 'expo-secure-store';

const _get_item_securestore = async (key: string): Promise<null | string> => {
  try {
    let result = await SecureStore.getItemAsync(key);
    if (result) return result;
    else return null;
  } catch (error) {
    console.log(error)
    return null;
  }
}

const _delete_item_securestore = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.log(error)
  }
}

export { _get_item_securestore, _delete_item_securestore };