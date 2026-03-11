import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabaseClient";

export function useRegistros() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    fetchRegistros();
  }, []);

  async function fetchRegistros() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("registros")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }
      console.log(data);
      setRegistros(data || []);
    } catch (err) {
      setError(err.message || "Error al cargar los registros");
    } finally {
      setLoading(false);
    }
  }

  async function createRegistro({
    nombre,
    monto,
    categoria,
    metodo,
    descripcion,
  }) {
    console.log(nombre,"nombre desde el use")
    try {
      const { data, error } = await supabase
        .from("registros")
        .insert({
          nombre,
          monto,
          categoria,
          metodo,
          descripcion,
        })
        .select("*")
        .single();
      setLoading(false);
      if (error) {
        setError(error.message);
        return { data: null, error };
      }
      return data;
    } catch (err) {
      setError(err.message || "Error al crear un registro");
    } finally {
      setLoading(false);
    }
  }

  async function updateRegistro(id, datos) {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("registros")
      .update({
        nombre: datos.nombre,
        monto: datos.monto,
        categoria: datos.categoria,
        metodo: datos.metodo,
        descripcion: datos.descripcion,
      })

      .eq("id", id)
      .select();

    setLoading(false);
    if (error) {
      setError(error.message);
      return { data: null, error };
    }
    console.log(data);
    setRegistros((prev) =>
      prev.map((reg) => (reg.id === data[0].id ? data[0] : reg)),
    );
    return { data: data[0], error: null };
  }

  async function deleteRegistro(id) {
    console.log("Estoy eliminando desde el UseRegistro", id);
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("registros").delete().eq("id", id);

    setLoading(false);

    if (error) {
      setError(error.message);
      return { success: false, error };
    }

    // Actualiza el estado para eliminar localmente el registro borrado
    setRegistros((prev) => prev.filter((reg) => reg.id !== id));

    return { success: true, error: null };
  }

  const categorias = useMemo(() => {
    const unique = [
      ...new Set(registros.map((r) => r.categoria).filter(Boolean)),
    ];
    return unique.sort();
  }, [registros]);

  const filteredRegistros = useMemo(() => {
    let result = [...registros];

    if (categoriaFilter) {
      result = result.filter((r) => r.categoria === categoriaFilter);
    }

    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      desde.setHours(0, 0, 0, 0);
      result = result.filter((r) => new Date(r.created_at) >= desde);
    }

    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.created_at) <= hasta);
    }

    return result;
  }, [registros, categoriaFilter, fechaDesde, fechaHasta]);

  return {
    registros: filteredRegistros,
    allRegistros: registros,
    loading,
    error,
    categorias,
    categoriaFilter,
    setCategoriaFilter,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    refetch: fetchRegistros,
    deleteRegistro,
    updateRegistro,
    createRegistro,
  };
}
