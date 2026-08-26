const { createApp, ref, computed } = Vue;

createApp({
    setup() {
        const foodDatabase = ref([]);
        const selectedCategory = ref('全部');
        const selectedFoodName = ref('');
        const inputWeight = ref(100);

        const meals = ref({
            早餐: [],
            午餐: [],
            晚餐: []
        });

        const categories = computed(() => [
            ...new Set(foodDatabase.value.map(item => item.category))
        ]);

        const filteredFoods = computed(() => {
            if (selectedCategory.value === '全部') {
                return foodDatabase.value;
            }
            return foodDatabase.value.filter(
                item => item.category === selectedCategory.value
            );
        });

        const currentSelectedFood = computed(() =>
            foodDatabase.value.find(
                item => item.name === selectedFoodName.value
            )
        );

        const calculatedPreview = computed(() => {
            if (!currentSelectedFood.value || !inputWeight.value) {
                return { calories: 0, protein: 0, fat: 0, carbs: 0 };
            }

            const ratio = inputWeight.value / 100;
            const food = currentSelectedFood.value;

            return {
                calories: Math.round(food.calories * ratio),
                protein: (food.protein_g * ratio).toFixed(1),
                fat: (food.fat_g * ratio).toFixed(1),
                carbs: (food.carbs_g * ratio).toFixed(1)
            };
        });

        const addFoodToMeal = mealType => {
            if (!currentSelectedFood.value || inputWeight.value <= 0) return;

            const food = currentSelectedFood.value;
            const ratio = inputWeight.value / 100;

            meals.value[mealType].push({
                name: food.name,
                weight_g: inputWeight.value,
                calories: Math.round(food.calories * ratio),
                protein_g: Number((food.protein_g * ratio).toFixed(1)),
                fat_g: Number((food.fat_g * ratio).toFixed(1)),
                carbs_g: Number((food.carbs_g * ratio).toFixed(1))
            });
        };

        const removeFoodFromMeal = (mealType, idx) => {
            meals.value[mealType].splice(idx, 1);
        };

        const getMealSummary = mealType =>
            meals.value[mealType].reduce(
                (acc, item) => {
                    acc.calories += item.calories;
                    acc.protein += item.protein_g;
                    acc.fat += item.fat_g;
                    acc.carbs += item.carbs_g;
                    return acc;
                },
                { calories: 0, protein: 0, fat: 0, carbs: 0 }
            );

        const breakfastCalories = computed(() => getMealSummary('早餐').calories);
        const lunchCalories = computed(() => getMealSummary('午餐').calories);
        const dinnerCalories = computed(() => getMealSummary('晚餐').calories);

        const totalMealCalories = computed(
            () =>
                breakfastCalories.value +
                lunchCalories.value +
                dinnerCalories.value
        );

        const dailyTotals = computed(() => {
            const total = {
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0
            };

            ['早餐', '午餐', '晚餐'].forEach(type => {
                const sum = getMealSummary(type);
                total.calories += sum.calories;
                total.protein += sum.protein;
                total.fat += sum.fat;
                total.carbs += sum.carbs;
            });

            return {
                calories: total.calories,
                protein: Number(total.protein.toFixed(1)),
                fat: Number(total.fat.toFixed(1)),
                carbs: Number(total.carbs.toFixed(1))
            };
        });

        const clearAllMeals = () => {
            if (confirm('確定要清空今日的三餐紀錄嗎？')) {
                meals.value = {
                    早餐: [],
                    午餐: [],
                    晚餐: []
                };
            }
        };

        fetch('food.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`food.json 載入失敗：${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                foodDatabase.value = data;
            })
            .catch(error => {
                console.error(error);
                alert('食物資料載入失敗，請確認 food.json 與網站放在同一個資料夾。');
            });

        return {
            foodDatabase,
            selectedCategory,
            selectedFoodName,
            inputWeight,
            meals,
            categories,
            filteredFoods,
            currentSelectedFood,
            calculatedPreview,
            addFoodToMeal,
            removeFoodFromMeal,
            getMealSummary,
            breakfastCalories,
            lunchCalories,
            dinnerCalories,
            totalMealCalories,
            dailyTotals,
            clearAllMeals
        };
    }
}).mount('#app');
