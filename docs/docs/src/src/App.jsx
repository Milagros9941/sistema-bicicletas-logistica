import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('estaciones');
  const [estaciones, setEstaciones] = useState([]);
  const [bicicletas, setBicicletas] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const [dniUsuario, setDniUsuario] = useState('');
  const [idMedioPago, setIdMedioPago] = useState(1);
  const [biciRetiro, setBiciRetiro] = useState('');
  const [estacionOrigen, setEstacionOrigen] = useState('');
  
  const [biciDevolucion, setBiciDevolucion] = useState('');
  const [estacionDestino, setEstacionDestino] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    try {
      const { data: est } = await supabase.from('estacion').select('*');
      setEstaciones(est || []);

      const { data: bici } = await supabase.from('bicicleta').select('*');
      setBicicletas(bici || []);

      const { data: tar } = await supabase.from('tarea_mantenimiento').select('*');
      setTareas(tar || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleRetirarBicicleta = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });
    try {
      const { error: errorViaje } = await supabase.from('viaje').insert([
        {
          dni_usuario: dniUsuario,
          id_medio_pago: parseInt(idMedioPago),
          numero_serie: biciRetiro,
          codigo_est_origen: estacionOrigen,
          fecha_hora_inicio: new Date().toISOString()
        }
      ]);
      if (errorViaje) throw errorViaje;

      const { error: errorBici } = await supabase
        .from('bicicleta')
        .update({ estado: 'en_uso' })
        .eq('numero_serie', biciRetiro);
      if (errorBici) throw errorBici;

      setMensaje({ texto: '¡Bicicleta retirada con éxito!', tipo: 'success' });
      cargarDatos();
    } catch (error) {
      setMensaje({ texto: 'Error al retirar: ' + error.message, tipo: 'error' });
    }
  };

  const handleDevolverBicicleta = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });
    try {
      const { data: viajeActivo } = await supabase
        .from('viaje')
        .select('id_viaje')
        .eq('numero_serie', biciDevolucion)
        .is('fecha_hora_fin', null)
        .single();

      if (!viajeActivo) throw new Error('No se encontró un viaje activo para esta bicicleta.');

      const { error: errorViaje } = await supabase
        .from('viaje')
        .update({
          codigo_est_destino: estacionDestino,
          fecha_hora_fin: new Date().toISOString()
        })
        .eq('id_viaje', viajeActivo.id_viaje);
      if (errorViaje) throw errorViaje;

      const { error: errorBici } = await supabase
        .from('bicicleta')
        .update({ estado: 'disponible', codigo_estacion: estacionDestino })
        .eq('numero_serie', biciDevolucion);
      if (errorBici) throw errorBici;

      setMensaje({ texto: '¡Bicicleta devuelta con éxito!', tipo: 'success' });
      cargarDatos();
    } catch (error) {
      setMensaje({ texto: 'Error al devolver: ' + error.message, tipo: 'error' });
    }
  };

  const handleCompletarTarea = async (idTarea) => {
    try {
      const { error } = await supabase
        .from('tarea_mantenimiento')
        .update({ estado: 'realizada' })
        .eq('id_tarea', idTarea);
      if (error) throw error;
      cargarDatos();
    } catch (error) {
      alert('Error al actualizar la tarea: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-blue-700 text-white shadow py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">Sistema Logístico de Bicicletas Compartidas</h1>
        <span className="text-sm bg-blue-800 px-3 py-1 rounded-full">UTN - Tecnicatura en Logística</span>
      </header>

      <nav className="bg-white shadow px-6 flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('estaciones')}
          className={`py-3 px-4 font-semibold border-b-2 ${activeTab === 'estaciones' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          Estado de Estaciones y Flota
        </button>
        <button
          onClick={() => setActiveTab('viajes')}
          className={`py-3 px-4 font-semibold border-b-2 ${activeTab === 'viajes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          Retiro y Devolución
        </button>
        <button
          onClick={() => setActiveTab('mantenimiento')}
          className={`py-3 px-4 font-semibold border-b-2 ${activeTab === 'mantenimiento' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          Mantenimiento (Operarios)
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {mensaje.texto && (
          <div className={`p-4 mb-4 rounded ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensaje.texto}
          </div>
        )}

        {activeTab === 'estaciones' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Disponibilidad de Estaciones y Flota</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {estaciones.map((est) => {
                const bicisEstacion = bicicletas.filter((b) => b.codigo_estacion === est.codigo);
                return (
                  <div key={est.codigo} className="bg-white p-5 rounded-lg shadow border">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-blue-700">{est.codigo} - {est.direccion}</h3>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">Capacidad: {est.capacidad_maxima}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Bicicletas presentes: {bicisEstacion.length}</p>
                    <div className="space-y-2">
                      {bicisEstacion.map((b) => (
                        <div key={b.numero_serie} className="flex justify-between items-center bg-gray-50 p-2 rounded border text-sm">
                          <span>🚲 <strong>{b.numero_serie}</strong></span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            b.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                            b.estado === 'en_uso' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {b.estado}
                          </span>
                        </div>
                      ))}
                      {bicisEstacion.length === 0 && <p className="text-sm text-gray-400 italic">Sin unidades físicas en esta estación.</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'viajes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold mb-4 text-blue-600">Retirar Bicicleta (E4)</h2>
              <form onSubmit={handleRetirarBicicleta} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">DNI de Usuario</label>
                  <input type="text" value={dniUsuario} onChange={(e) => setDniUsuario(e.target.value)} required className="w-full border p-2 rounded" placeholder="Ej: 12345678" />
                </div>
                <div>
                  <label className="block text-sm font-medium">ID Medio de Pago</label>
                  <input type="number" value={idMedioPago} onChange={(e) => setIdMedioPago(e.target.value)} required className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium">N.º de Serie de Bicicleta</label>
                  <input type="text" value={biciRetiro} onChange={(e) => setBiciRetiro(e.target.value)} required className="w-full border p-2 rounded" placeholder="Ej: BIC001" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Estación de Origen</label>
                  <select value={estacionOrigen} onChange={(e) => setEstacionOrigen(e.target.value)} required className="w-full border p-2 rounded">
                    <option value="">Seleccione estación</option>
                    {estaciones.map(e => <option key={e.codigo} value={e.codigo}>{e.codigo} - {e.direccion}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700">Confirmar Retiro</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold mb-4 text-green-600">Devolver Bicicleta (E5)</h2>
              <form onSubmit={handleDevolverBicicleta} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">N.º de Serie de Bicicleta</label>
                  <input type="text" value={biciDevolucion} onChange={(e) => setBiciDevolucion(e.target.value)} required className="w-full border p-2 rounded" placeholder="Ej: BIC001" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Estación de Destino</label>
                  <select value={estacionDestino} onChange={(e) => setEstacionDestino(e.target.value)} required className="w-full border p-2 rounded">
                    <option value="">Seleccione estación</option>
                    {estaciones.map(e => <option key={e.codigo} value={e.codigo}>{e.codigo} - {e.direccion}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white p-2 rounded font-semibold hover:bg-green-700 mt-12">Confirmar Devolución</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'mantenimiento' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Control de Tareas Técnicas</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden border">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 text-sm">
                    <th className="p-3">ID Tarea</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Estación</th>
                    <th className="p-3">Descripción</th>
                    <th className="p-3">Operario (Legajo)</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {tareas.map((t) => (
                    <tr key={t.id_tarea}>
                      <td className="p-3 font-semibold">#{t.id_tarea}</td>
                      <td className="p-3">{t.fecha}</td>
                      <td className="p-3">{t.codigo_estacion}</td>
                      <td className="p-3">{t.descripcion}</td>
                      <td className="p-3">{t.legajo_operario}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          t.estado === 'realizada' ? 'bg-green-100 text-green-800' :
                          t.estado === 'programada' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.estado}
                        </span>
                      </td>
                      <td className="p-3">
                        {t.estado === 'programada' && (
                          <button
                            onClick={() => handleCompletarTarea(t.id_tarea)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-600"
                          >
                            Marcar Realizada
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tareas.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-400">No hay tareas de mantenimiento cargadas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
