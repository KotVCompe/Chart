let chart = null;
const API_BASE = 'http://localhost:3000/api/charts';

document.addEventListener('DOMContentLoaded', function() {
    loadChartData();
    loadStats();
});

// Загрузка данных для диаграммы
async function loadChartData() {
    try {
        const chartType = document.getElementById('chartType').value;
        const response = await fetch(`${API_BASE}/data/${chartType}`);
        const chartData = await response.json();

        renderChart(chartData, chartType);
        showNotification('Диаграмма успешно загружена!', 'success');
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showNotification('Ошибка загрузки данных!', 'error');
    }
}

function renderChart(data, type) {
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    const config = {
        type: type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Диаграмма: ${getChartTypeName(type)}`,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top',
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    };

    // Дополнительные настройки для разных типов диаграмм
    if (type === 'bar') {
        config.options.scales = {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        };
    } else if (type === 'line') {
        config.options.scales = {
            y: {
                beginAtZero: true
            }
        };
    }

    chart = new Chart(ctx, config);
}

// Загрузка статистики
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const stats = await response.json();

        displayStats(stats);
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Отображение статистики
function displayStats(stats) {
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Общая сумма</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.average.toFixed(2)}</div>
            <div class="stat-label">Среднее значение</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.max}</div>
            <div class="stat-label">Максимум</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.min}</div>
            <div class="stat-label">Минимум</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.count}</div>
            <div class="stat-label">Количество записей</div>
        </div>
    `;
}

// Загрузка всех данных
async function loadAllData() {
    try {
        const response = await fetch(`${API_BASE}/data`);
        const data = await response.json();
        
        document.getElementById('rawDataContent').textContent = JSON.stringify(data, null, 2);
        document.getElementById('rawData').classList.remove('hidden');
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Создание новой записи
async function createData() {
    const category = document.getElementById('category').value;
    const value = document.getElementById('value').value;
    const color = document.getElementById('color').value;

    if (!category || !value) {
        showNotification('Заполните категорию и значение!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                category,
                value: parseFloat(value),
                color
            })
        });

        if (response.ok) {
            showNotification('Запись успешно создана!', 'success');
            clearForm();
            loadChartData();
            loadStats();
        } else {
            throw new Error('Ошибка создания записи');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка создания записи!', 'error');
    }
}

// Обновление записи
async function updateData() {
    const id = document.getElementById('dataId').value;
    const category = document.getElementById('category').value;
    const value = document.getElementById('value').value;
    const color = document.getElementById('color').value;

    if (!id || !category || !value) {
        showNotification('Заполните ID, категорию и значение!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/data/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                category,
                value: parseFloat(value),
                color
            })
        });

        if (response.ok) {
            showNotification('Запись успешно обновлена!', 'success');
            clearForm();
            loadChartData();
            loadStats();
        } else {
            throw new Error('Ошибка обновления записи');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка обновления записи!', 'error');
    }
}

// Удаление записи
async function deleteData() {
    const id = document.getElementById('dataId').value;

    if (!id) {
        showNotification('Введите ID для удаления!', 'error');
        return;
    }

    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/data/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Запись успешно удалена!', 'success');
            clearForm();
            loadChartData();
            loadStats();
        } else {
            throw new Error('Ошибка удаления записи');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка удаления записи!', 'error');
    }
}

// Очистка формы
function clearForm() {
    document.getElementById('dataId').value = '';
    document.getElementById('category').value = '';
    document.getElementById('value').value = '';
    document.getElementById('color').value = '#FF6384';
    document.getElementById('rawData').classList.add('hidden');
}

// Показать уведомление
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Получить русское название типа диаграммы
function getChartTypeName(type) {
    const names = {
        'bar': 'Гистограмма',
        'line': 'Линейная диаграмма',
        'pie': 'Круговая диаграмма',
        'doughnut': 'Кольцевая диаграмма',
        'radar': 'Радарная диаграмма'
    };
    return names[type] || type;
}