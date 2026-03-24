import axios from 'axios';
import { API_URL } from '../config/api';

export const handleLinkClick = async (
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  endpoint: string,
  route: string,
  navigate: (path: string, state?: object) => void
) => {
  event.preventDefault();

  try {
    const response = await axios.get(`${API_URL}/${endpoint}`);
    navigate(`/${route}`, { state: { [route]: response.data } });
  } catch (error) {
    console.error(`Error al obtener ${endpoint}:`, error);
  }
};