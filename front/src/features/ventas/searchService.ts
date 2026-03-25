import api from '../../shared/api/api';
import { API_URL } from '../../shared/api/api';

export const handleLinkClick = async (
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  endpoint: string,
  route: string,
  navigate: (path: string, state?: object) => void
) => {
  event.preventDefault();

  try {
    const response = await api.get(`${API_URL}/${endpoint}`);
    navigate(`/${route}`, { state: { [route]: response.data } });
  } catch (error) {
    console.error(`Error al obtener ${endpoint}:`, error);
  }
};
