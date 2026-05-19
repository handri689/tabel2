import { useState, useEffect } from "react";
import {supabase } from "../supabase";

function HalamanRekapAbsensi(){
    const [absensiList, setAbsensiList] = useState([]);
    const [tanggal, setTanggal] = useState('');
    const [loading, setLoading]= useState(false);
const ambilRekap = async () => {
    if (!tanggal) {
        alert('Pilih tanggal dulu!');
        return;
    }
    setLoading(true);

    const { data, error } = await supabase
        .from('absensi')
        .select('*, pengguna(nama)')
        .eq('tanggal', tanggal)
        .order('pengguna(nama)', { ascending: true });

    console.log('tanggal:', tanggal);
    console.log('data:', data);
    console.log('error:', error);

    if (error) {
        alert('Gagal ambil data: ' + error.message);
    } else {
        setAbsensiList(data || []);
    }
    setLoading(false);
};

const warnaBadge = (status) => {
        if (status === 'hadir') return 'bg-green-100 text-green-700';
        if (status === 'izin') return 'bg-yellow-100 text-yellow-700';
        if (status === 'sakit') return 'bg-blue-100 text-blue-700';
        if (status === 'alpha') return 'bg-red-100 text-red-700';
    };

    // Hitung total per status
    const hitung = (status) => absensiList.filter(a => a.status === status).length;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Rekap Absensi</h1>

            {/* Filter Tanggal */}
            <div className="flex gap-3 mb-6">
                <input
                    type="date"
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                    className="border p-2 rounded"
                />
                <button
                    onClick={ambilRekap}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Memuat...' : 'Lihat Rekap'}
                </button>
            </div>

            {/* Statistik */}
            {absensiList.length > 0 && (
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
            )}

            {/* Tabel Rekap */}
            {absensiList.length > 0 ? (
                <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left">No</th>
                            <th className="border p-2 text-left">Nama Siswa</th>
                            <th className="border p-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {absensiList.map((a, i) => (
                            <tr key={a.id} className="hover:bg-gray-50">
                                <td className="border p-2">{i + 1}</td>
                                <td className="border p-2">{a.pengguna?.nama}</td>
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
                <p className="text-gray-500">Pilih tanggal dan klik "Lihat Rekap"</p>
            )}
        </div>
    );
}

export default HalamanRekapAbsensi;

