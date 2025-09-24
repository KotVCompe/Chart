const { pool } = require('../config/database');

class ChartData {
  // Получить все данные
  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM chart_data ORDER BY id'
    );
    return result.rows;
  }

  // Добавить новую запись
  static async create(category, value, color = null) {
    const result = await pool.query(
      'INSERT INTO chart_data (category, value, color) VALUES ($1, $2, $3) RETURNING *',
      [category, value, color]
    );
    return result.rows[0];
  }

  // Обновить запись
  static async update(id, category, value, color) {
    const result = await pool.query(
      'UPDATE chart_data SET category = $1, value = $2, color = $3 WHERE id = $4 RETURNING *',
      [category, value, color, id]
    );
    return result.rows[0];
  }

  // Удалить запись
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM chart_data WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // Получить данные для разных типов диаграмм
  static async getChartData(chartType) {
    const data = await this.getAll();
    
    switch (chartType) {
      case 'bar':
      case 'line':
        return {
          labels: data.map(item => item.category),
          datasets: [{
            label: 'Значения',
            data: data.map(item => item.value),
            backgroundColor: data.map(item => item.color || '#36A2EB'),
            borderColor: data.map(item => item.color || '#36A2EB'),
            borderWidth: 1
          }]
        };
      
      case 'pie':
      case 'doughnut':
        return {
          labels: data.map(item => item.category),
          datasets: [{
            data: data.map(item => item.value),
            backgroundColor: data.map(item => item.color || this.getRandomColor()),
            hoverBackgroundColor: data.map(item => this.darkenColor(item.color || this.getRandomColor()))
          }]
        };
      
      case 'radar':
        return {
          labels: data.map(item => item.category),
          datasets: [{
            label: 'Показатели',
            data: data.map(item => item.value),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: data.map(item => item.color || '#36A2EB')
          }]
        };
      
      default:
        return data;
    }
  }

  // Генерация случайного цвета
  static getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }

  // Затемнение цвета
  static darkenColor(color) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = -50;
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
           (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
           (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
}

module.exports = ChartData;