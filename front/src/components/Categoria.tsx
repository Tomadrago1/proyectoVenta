import React, { useState, useEffect } from 'react';
import { Categoria } from '../interface/categoria';
import axios from 'axios';
import '../styles/CategoriaStyle.css';

const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [editId, setEditId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newCategoria, setNewCategoria] = useState<Categoria>({
    id_categoria: '',
    nombre: '',
  });

  const fetchCategorias = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/categoria');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEditLoad = async (id: string) => {
    if (id) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/categoria/${id}`
        );
        setNewCategoria(response.data);
        setSelectedAction('modificar');
        setEditId(id);
        setError('');
      } catch (error) {
        setError('Categoria no encontrada');
        resetForm();
      }
    }
  };

  const handleDeleteLoad = async (id: string) => {
    if (id) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/categoria/${id}`
        );
        setNewCategoria(response.data);
        setSelectedAction('eliminar');
        setEditId(id);
        setError('');
      } catch (error) {
        setError('Categoria no encontrada');
        resetForm();
      }
    }
  };

  const createCategoria = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/categoria', {
        ...newCategoria,
      });
      setCategorias((prevCategorias) => [...prevCategorias, response.data]);
      resetForm();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const updateCategoria = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/categoria/${newCategoria.id_categoria}`,
        {
          ...newCategoria,
        }
      );
      setCategorias((prevCategorias) =>
        prevCategorias.map((categoria) =>
          categoria.id_categoria === response.data.id_categoria
            ? response.data
            : categoria
        )
      );
      resetForm();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategoria = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/categoria/${newCategoria.id_categoria}`
      );
      setCategorias((prevCategorias) =>
        prevCategorias.filter(
          (categoria) => categoria.id_categoria !== newCategoria.id_categoria
        )
      );
      resetForm();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const resetForm = () => {
    setNewCategoria({
      id_categoria: '',
      nombre: '',
    });
    setSelectedAction('');
    setEditId('');
    setError('');
  };

  const searchCategorias = async (search: string) => {
    try {
      if (search.trim() === '') {
        fetchCategorias();
      } else {
        const response = await axios.get(
          `http://localhost:3000/api/categoria/search/${search}`
        );
        setCategorias(response.data);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchCategorias(value);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return (
    <div className="container_categoria">
      <h1>Categorías</h1>
      <div className="action-buttons">
        <button
          onClick={() => {
            resetForm();
            setSelectedAction('crear');
          }}
        >
          Crear Categoría
        </button>
        <button onClick={() => setSelectedAction('modificar')}>
          Modificar Categoría
        </button>
        <button onClick={() => setSelectedAction('eliminar')}>
          Eliminar Categoría
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar Categoría por Nombre"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="category-table">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id_categoria}>
                <td>{categoria.nombre}</td>
                <td>
                  <button
                    onClick={() => handleEditLoad(categoria.id_categoria)}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteLoad(categoria.id_categoria)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAction && (
        <div className="category-form">
          <h3>
            {selectedAction === 'crear'
              ? 'Crear Categoría'
              : selectedAction === 'modificar'
              ? 'Modificar Categoría'
              : selectedAction === 'eliminar'
              ? 'Eliminar Categoría'
              : ''}
          </h3>

          {error && <p className="error-message">{error}</p>}

          {(selectedAction === 'modificar' ||
            selectedAction === 'eliminar') && (
            <div className="form-group">
              <label>ID de la Categoría</label>
              <input
                type="text"
                placeholder="ID de la Categoría"
                value={editId}
                onChange={(e) => setEditId(e.target.value)}
                onBlur={() => {
                  if (selectedAction === 'modificar') {
                    handleEditLoad(editId);
                  } else if (selectedAction === 'eliminar') {
                    handleDeleteLoad(editId);
                  }
                }}
              />
            </div>
          )}
          <div className="form-group">
            <label>Nombre de la Categoría</label>
            <input
              type="text"
              value={newCategoria.nombre}
              onChange={(e) =>
                setNewCategoria({
                  ...newCategoria,
                  nombre: e.target.value,
                })
              }
            />
          </div>
          <div className="form-buttons">
            {selectedAction === 'crear' && (
              <button onClick={createCategoria}>Crear</button>
            )}
            {selectedAction === 'modificar' && (
              <button onClick={updateCategoria}>Actualizar</button>
            )}
            {selectedAction === 'eliminar' && (
              <button onClick={deleteCategoria}>Eliminar</button>
            )}
            <button className="cancel-button" onClick={resetForm}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categorias;
