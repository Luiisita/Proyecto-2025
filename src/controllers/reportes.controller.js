import db from "../config/db.js";  

// =======================
// 📊 VENTAS MENSUALES
// =======================
export const getVentasMensuales = async (req, res) => {
  try {
    let { year, month } = req.query;
    const ahora = new Date();

    if (!year) year = ahora.getFullYear();
    if (!month) month = ahora.getMonth() + 1; // 0-11

    const [rows] = await db.query(
      `SELECT 
        WEEK(rv.Fecha, 1) - WEEK(DATE_SUB(rv.Fecha, INTERVAL DAYOFMONTH(rv.Fecha)-1 DAY), 1) + 1 AS semana,
        mp.Nombre AS metodo_pago,
        SUM(rv.Cantidad) AS total
      FROM  Registro_Ventas rv
      INNER JOIN Metodo_Pago mp ON rv.Id_Metodo = mp.Id_Metodo
      WHERE YEAR(rv.Fecha) = ? AND MONTH(rv.Fecha) = ?
      GROUP BY semana, metodo_pago
      ORDER BY semana, metodo_pago;`,
      [year, month]
    );

    res.json({ year, month, ventas: rows });
  } catch (error) {
    console.error("Error en getVentasMensuales:", error);
    res.status(500).json({ message: "Error al obtener reporte mensual" });
  }
};


// =======================
// 📊 SEMANA ESPECÍFICA
// =======================
export const getSemanaEspecifica = async (req, res) => {
  try {
    const { year, week } = req.query;
    if (!year || !week) return res.status(400).json({ message: "Falta year o week" });

    const [rows] = await db.query(
      `SELECT 
        WEEK(rv.Fecha, 1) AS semana,
        mp.Nombre AS metodo_pago,
        SUM(rv.Cantidad) AS total
       FROM Registro_Ventas rv
       INNER JOIN Metodo_Pago mp ON rv.Id_Metodo = mp.Id_Metodo
       WHERE YEAR(rv.Fecha) = ? AND WEEK(rv.Fecha, 1) = ?
       GROUP BY semana, metodo_pago`,
      [year, week]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error en getSemanaEspecifica:", error);
    res.status(500).json({ message: "Error al obtener datos" });
  }
};


// =======================
// 📊 VENTAS ANUALES
// =======================
export const getVentasAnuales = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ message: "Falta el parámetro year" });

    const [rows] = await db.query(
      `SELECT 
        MONTH(rv.Fecha) AS mes,
        mp.Nombre AS metodo_pago,
        SUM(rv.Cantidad) AS total
      FROM Registro_Ventas rv
      INNER JOIN Metodo_Pago mp ON rv.Id_Metodo = mp.Id_Metodo
      WHERE YEAR(rv.Fecha) = ?
      GROUP BY mes, metodo_pago
      ORDER BY mes`,
      [year]
    );

    // Meses para el gráfico
    const meses = [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    const metodos = [...new Set(rows.map(r => r.metodo_pago))];

    const datasets = metodos.map(metodo => ({
      label: `Ganancias ${metodo}`,
      data: Array(12).fill(0),
      borderColor: "#"+Math.floor(Math.random()*16777215).toString(16),
      backgroundColor: "rgba(0,0,0,0.1)",
      fill: true
    }));

    rows.forEach(r => {
      const mesIndex = r.mes - 1;
      const dsIndex = metodos.indexOf(r.metodo_pago);
      datasets[dsIndex].data[mesIndex] = r.total;
    });

    res.json({ labels: meses, datasets });
  } catch (error) {
    console.error("Error en getVentasAnuales:", error);
    res.status(500).json({ message: "Error al obtener reporte anual" });
  }
};


// =======================
// 📊 GANANCIAS DIARIAS
// =======================
export const getGananciasDiarias = async (req, res) => {
  try {
    const { fecha } = req.params;

    const [rows] = await db.query(
      `SELECT mp.Nombre AS metodo_pago, 
              SUM(rv.Cantidad) AS total
       FROM Registro_Ventas rv
       INNER JOIN Metodo_Pago mp ON rv.Id_Metodo = mp.Id_Metodo
       WHERE DATE(rv.Fecha) = ?
       GROUP BY metodo_pago`,
      [fecha]
    );

    const metodos = ["PSE", "QR", "Efectivo"];

    const data = metodos.map(metodo => {
      const registro = rows.find(r => r.metodo_pago === metodo);
      return registro ? registro.total : 0;
    });

    const datasets = [
      {
        label: "Ganancias",
        data,
        backgroundColor: ["#2f2540", "#9ea0a8", "#efe0c7"],
      },
    ];

    res.json({ labels: metodos, datasets });
  } catch (error) {
    console.error("Error en getGananciasDiarias:", error);
    res.status(500).json({ message: "Error al obtener reporte diario" });
  }
};
