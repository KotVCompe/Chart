const express = require('express');
const router = express.Router();
const ChartData = require('../models/chartData');

// Получить данные для диаграммы по типу
router.get('/data/:chartType', async (req, res) => {
  try {
    const { chartType } = req.params;
    const validChartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar'];
    
    if (!validChartTypes.includes(chartType)) {
      return res.status(400).json({ error: 'Invalid chart type' });
    }

    const chartData = await ChartData.getChartData(chartType);
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все данные
router.get('/data', async (req, res) => {
  try {
    const data = await ChartData.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить новую запись
router.post('/data', async (req, res) => {
  try {
    const { category, value, color } = req.body;
    
    if (!category || value === undefined) {
      return res.status(400).json({ error: 'Category and value are required' });
    }

    const newData = await ChartData.create(category, parseFloat(value), color);
    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить запись
router.put('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, value, color } = req.body;

    const updatedData = await ChartData.update(
      parseInt(id), 
      category, 
      parseFloat(value), 
      color
    );
    
    if (!updatedData) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить запись
router.delete('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedData = await ChartData.delete(parseInt(id));
    
    if (!deletedData) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить статистику
router.get('/stats', async (req, res) => {
  try {
    const data = await ChartData.getAll();
    const stats = {
      total: data.reduce((sum, item) => sum + item.value, 0),
      average: data.reduce((sum, item) => sum + item.value, 0) / data.length,
      max: Math.max(...data.map(item => item.value)),
      min: Math.min(...data.map(item => item.value)),
      count: data.length
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/data/bulk', async (req, res) => {
    try {
        const { data } = req.body;
        
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Data must be an array' });
        }

        // Очищаем существующие данные
        const existingData = await ChartData.getAll();
        for (const item of existingData) {
            await ChartData.delete(item.id);
        }

        // Добавляем новые данные
        const results = [];
        for (const item of data) {
            const newItem = await ChartData.create(
                item.category,
                parseFloat(item.value),
                item.color
            );
            results.push(newItem);
        }

        res.json({ 
            message: `Successfully uploaded ${results.length} items`,
            data: results 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;