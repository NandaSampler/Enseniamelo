// src/components/MisCursos/ListaCurso.jsx

function ListaCurso({ cursos }) {
    if (!cursos || cursos.length === 0) {
        return <p className="mt-4 text-gray-600">No hay cursos registrados.</p>;
    }

    const formatPrecio = (valor) => {
        if (valor === null || valor === undefined) return "—";
        // valor viene como string/number, lo convertimos a número para formatear
        const num = Number(valor);
        if (isNaN(num)) return String(valor);
        return `$ ${num.toFixed(2)}`;
    };

    const formatBool = (valor) => (valor ? "Sí" : "No");

    return (
        <div className="mt-4 overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
                <thead>
                    <tr className="bg-slate-100 text-left">
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Nombre</th>
                        <th className="px-4 py-2">Descripción</th>
                        <th className="px-4 py-2">Modalidad</th>
                        <th className="px-4 py-2">Precio reserva</th>
                        <th className="px-4 py-2">¿Tiene cupo?</th>
                        <th className="px-4 py-2">Cupo</th>
                        <th className="px-4 py-2">Cupo ocupado</th>
                        <th className="px-4 py-2">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {cursos.map((curso) => (
                        <tr key={curso.id} className="border-t">
                            <td className="px-4 py-2 text-xs text-gray-500">
                                {curso.id}
                            </td>
                            <td className="px-4 py-2 font-medium">
                                {curso.nombre}
                            </td>
                            <td className="px-4 py-2 max-w-xs">
                                <span className="line-clamp-2">
                                    {curso.descripcion || "—"}
                                </span>
                            </td>
                            <td className="px-4 py-2 capitalize">
                                {curso.modalidad}
                            </td>
                            <td className="px-4 py-2">
                                {formatPrecio(curso.precio_reserva)}
                            </td>
                            <td className="px-4 py-2">
                                {formatBool(curso.tiene_cupo)}
                            </td>
                            <td className="px-4 py-2">
                                {curso.cupo ?? "—"}
                            </td>
                            <td className="px-4 py-2">
                                {curso.cupo_ocupado}
                            </td>
                            <td className="px-4 py-2 capitalize">
                                {curso.estado}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListaCurso;
