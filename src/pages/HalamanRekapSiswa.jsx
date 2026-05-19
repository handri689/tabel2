import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useParams, useNavigate } from "react-router-dom";

function HalamanRekapSiswa() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [siswa, setSiswa] = useState(null);
    const [absensiList, setAbsensiList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ambilData = async () => {
            // Ambil data siswa
            const { data: dataSiswa } = await supabase
                .from('pengguna')
                .select('*')
                .eq('id', Number(id))
                .single();
            setSiswa(dataSiswa);

            // Ambil histori absensi siswa
            const { data: dataAbsensi } = await supabase
                .from('absensi')
                .select('*')
                .eq('siswa_id', Number(id))
                .order('tanggal', { ascending: false });
            setAbsensiList(dataAbsensi || []);
            setLoading(false);
        };
        ambilData();
    }, [id]);

    const warnaBadge = (status) => {
        if (status === 'hadir') return 'bg-green-100 text-green-700';
        if (status === 'izin') return 'bg-yellow-100 text-yellow-700';
        if (status === 'sakit') return 'bg-blue-100 text-blue-700';
        if (status === 'alpha') return 'bg-red-100 text-red-700';
    };

    const hitung = (status) => absensiList.filter(a => a.status === status).length;

    if (loading) return <div className="p-6">Memuat...</div>;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            {/* Tombol Kembali */}
            <button
                onClick={() => navigate('/')}
           className="
      flex items-center gap-2
      px-4 py-2
      bg-red-500 text-white
      rounded-xl
      hover:bg-red-600
      transition-all duration-300
    "
            >
                ← Kembali
            </button>

            {/* Info Siswa */}
            <h1 className="text-2xl font-bold mb-1">Rekap Absensi</h1>
            {siswa && (
                <p className="text-gray-600 mb-4">
                    Siswa: <strong>{siswa.nama}</strong> — {siswa.Kota}
                </p>
            )}

            {/* Statistik */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-green-100 p-3 rounded text-center">
                    <p className="text-sm text-green-700">Hadir</p>
                    <p className="text-2xl font-bold text-green-700">{hitung('hadir')}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded text-center">
                    <p className="text-sm text-yellow-700">Izin</p>
                    <p className="text-2xl font-bold text-yellow-700">{hitung('izin')}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded text-center">
                    <p className="text-sm text-blue-700">Sakit</p>
                    <p className="text-2xl font-bold text-blue-700">{hitung('sakit')}</p>
                </div>
                <div className="bg-red-100 p-3 rounded text-center">
                    <p className="text-sm text-red-700">Alpha</p>
                    <p className="text-2xl font-bold text-red-700">{hitung('alpha')}</p>
                </div>
            </div>

            {/* Tabel Histori */}
            {absensiList.length > 0 ? (
                <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left">No</th>
                            <th className="border p-2 text-left">Tanggal</th>
                            <th className="border p-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {absensiList.map((a, i) => (
                            <tr key={a.id} className="hover:bg-gray-50">
                                <td className="border p-2">{i + 1}</td>
                                <td className="border p-2">{a.tanggal}</td>
                                <td className="border p-2">
                                    <span className={`px-2 py-1 rounded text-sm font-semibold ${warnaBadge(a.status)}`}>
                                        {a.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-500">Belum ada data absensi untuk siswa ini.</p>
            )}
        </div>
    );
}

export default HalamanRekapSiswa;