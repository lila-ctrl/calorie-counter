const form = document.querySelector('#food-form');
const foodList = document.querySelector('#food-list');
const emptyState = document.querySelector('#empty-state');
const clearDayButton = document.querySelector('#clear-day');

const totalElements = {
  calories: document.querySelector('#total-calories'),
  protein: document.querySelector('#total-protein'),
  fat: document.querySelector('#total-fat'),
  carbs: document.querySelector('#total-carbs'),
};

let foods = JSON.parse(localStorage.getItem('calorieCounterFoods')) || [];

const formatNumber = (value) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

const calculateNutrition = (food) => {
  const multiplier = food.weight / 100;

  return {
    calories: food.calories * multiplier,
    protein: food.protein * multiplier,
    fat: food.fat * multiplier,
    carbs: food.carbs * multiplier,
  };
};

const saveFoods = () => {
  localStorage.setItem('calorieCounterFoods', JSON.stringify(foods));
};

const updateTotals = () => {
  const totals = foods.reduce((accumulator, food) => {
    const nutrition = calculateNutrition(food);

    accumulator.calories += nutrition.calories;
    accumulator.protein += nutrition.protein;
    accumulator.fat += nutrition.fat;
    accumulator.carbs += nutrition.carbs;

    return accumulator;
  }, {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  });

  Object.entries(totals).forEach(([key, value]) => {
    totalElements[key].textContent = formatNumber(value);
  });
};

const renderFoods = () => {
  foodList.innerHTML = '';
  emptyState.textContent = foods.length ? `${foods.length} продукт(ов) в дневнике.` : 'Пока нет добавленных продуктов.';
  clearDayButton.disabled = foods.length === 0;

  foods.forEach((food) => {
    const nutrition = calculateNutrition(food);
    const row = document.createElement('tr');
    const values = [
      food.name,
      `${formatNumber(food.weight)} г`,
      formatNumber(nutrition.calories),
      formatNumber(nutrition.protein),
      formatNumber(nutrition.fat),
      formatNumber(nutrition.carbs),
    ];

    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });

    const actionsCell = document.createElement('td');
    const removeButton = document.createElement('button');

    removeButton.className = 'remove-button';
    removeButton.type = 'button';
    removeButton.dataset.id = food.id;
    removeButton.textContent = 'Удалить';
    actionsCell.append(removeButton);
    row.append(actionsCell);

    foodList.append(row);
  });

  updateTotals();
  saveFoods();
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const food = {
    id: crypto.randomUUID(),
    name: formData.get('name').trim(),
    weight: Number(formData.get('weight')),
    calories: Number(formData.get('calories')),
    protein: Number(formData.get('protein')),
    fat: Number(formData.get('fat')),
    carbs: Number(formData.get('carbs')),
  };

  foods.push(food);
  form.reset();
  document.querySelector('#food-name').focus();
  renderFoods();
});

foodList.addEventListener('click', (event) => {
  const removeButton = event.target.closest('.remove-button');

  if (!removeButton) {
    return;
  }

  foods = foods.filter((food) => food.id !== removeButton.dataset.id);
  renderFoods();
});

clearDayButton.addEventListener('click', () => {
  foods = [];
  renderFoods();
});

renderFoods();
