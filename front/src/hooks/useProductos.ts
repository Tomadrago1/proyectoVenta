import { useState, useEffect } from 'react';
import api from '../config/api';
import { Producto } from '../interface/producto';
import { Categoria } from '../interface/categoria';
import { productoService } from '../services/productoService';
import { API_URL } from '../config/api';

type OFFProduct = {
    product_name?: string;
    product_name_es?: string;
    brands?: string;
    product_quantity?: string;
    product_quantity_unit?: string;
};

type OFFResponse = {
    status: number;
    product?: OFFProduct;
};

export const useProductos = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    useEffect(() => {
        fetchProductos();
        fetchCategorias();
    }, []);

    const fetchProductos = async () => {
        try {
            const data = await productoService.getAll();
            setProductos(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategorias = async () => {
        try {
            const response = await api.get(`${API_URL}/categoria`);
            setCategorias(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const searchProductos = async (search: string) => {
        try {
            if (search.trim() === '') {
                await fetchProductos();
            } else {
                const data = await productoService.search(search);
                setProductos(data);
            }
        } catch (error) {
            console.error('Error searching products:', error);
        }
    };

    const getCategoriaName = (id_categoria: string): string => {
        const categoria = categorias.find((cat) => cat.id_categoria === id_categoria);
        return categoria ? categoria.nombre : 'Categoría no encontrada';
    };

    const fetchNombreProducto = async (codigo: string): Promise<string> => {
        if (!codigo) return '';

        try {
            const url = `https://world.openfoodfacts.net/api/v2/product/${codigo}`;
            const params = new URLSearchParams({
                fields: 'status,product_name,product_name_es,brands,product_quantity,product_quantity_unit',
            });
            const response = await fetch(`${url}?${params.toString()}`);
            const data: OFFResponse = await response.json();

            if (data.status === 1 && data.product) {
                const p = data.product;

                const toTitleCase = (str: string) =>
                    str
                        .split(' ')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');

                const name = p.product_name_es || p.product_name || '';
                const brand = p.brands || '';
                let quantity = '';
                if (p.product_quantity) {
                    quantity = String(p.product_quantity);
                    if (p.product_quantity_unit) {
                        quantity += p.product_quantity_unit;
                    }
                }

                const parts = [];
                if (name) parts.push(toTitleCase(name));
                if (brand) parts.push(toTitleCase(brand));
                if (quantity) parts.push(quantity);

                return parts.join(' ').trim();
            }
            return '';
        } catch (error) {
            console.error('Error consultando OpenFoodFacts:', error);
            return '';
        }
    };

    return {
        productos,
        setProductos,
        categorias,
        searchProductos,
        getCategoriaName,
        fetchNombreProducto,
        fetchProductos,
    };
};
