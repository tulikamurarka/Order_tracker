document.addEventListener('DOMContentLoaded', function () {
    const orderForm = document.getElementById('orderForm');
    const pendingOrdersContainer = document.getElementById('pendingOrdersContainer');
    const pastOrdersContainer = document.getElementById('pastOrdersContainer');

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let pastOrders = JSON.parse(localStorage.getItem('pastOrders')) || [];

    function renderOrders() {
        pendingOrdersContainer.innerHTML = '';
        pastOrdersContainer.innerHTML = '';

        orders.forEach(order => {
            const orderDiv = createOrderDiv(order, false);
            pendingOrdersContainer.appendChild(orderDiv);
        });

        pastOrders.forEach(order => {
            const orderDiv = createOrderDiv(order, true);
            orderDiv.classList.add('pastOrder');
            pastOrdersContainer.appendChild(orderDiv);
        });
    }

    function createOrderDiv(order, isPastOrder) {
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('order');
        orderDiv.textContent = `${order.name} - Taken on: ${order.dateTaken}`;

        if (!isPastOrder) {
            const dispatchButton = document.createElement('button');
            dispatchButton.textContent = 'Dispatch';
            dispatchButton.addEventListener('click', () => dispatchOrder(order));
            orderDiv.appendChild(dispatchButton);
        } else {
            const timeDiv = document.createElement('div');
            timeDiv.textContent = `Dispatched in ${order.dispatchTime} days`;
            orderDiv.appendChild(timeDiv);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deletePastOrder(order));
            orderDiv.appendChild(deleteButton);

            const reactivateButton = document.createElement('button');
            reactivateButton.textContent = 'Reactivate';
            reactivateButton.addEventListener('click', () => reactivateOrder(order));
            orderDiv.appendChild(reactivateButton);
        }
        
        return orderDiv;
    }

    function dispatchOrder(order) {
        order.delivered = true;
        order.dateDispatched = new Date().toISOString().substring(0, 10);
        const daysToDispatch = calculateDays(order.dateTaken, order.dateDispatched);
        order.dispatchTime = daysToDispatch;
        orders = orders.filter(o => o !== order);
        pastOrders.push(order);
        updateLocalStorage();
        renderOrders();
    }

    function deletePastOrder(order) {
        pastOrders = pastOrders.filter(o => o !== order);
        updateLocalStorage();
        renderOrders();
    }

    function reactivateOrder(order) {
        orders.push(order);
        pastOrders = pastOrders.filter(o => o !== order);
        updateLocalStorage();
        renderOrders();
    }

    function calculateDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function updateLocalStorage() {
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('pastOrders', JSON.stringify(pastOrders));
    }

    renderOrders();

    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const orderName = document.getElementById('orderName').value;
        const orderTakenDate = document.getElementById('orderTakenDate').value;

        const newOrder = {
            name: orderName,
            dateTaken: orderTakenDate,
            delivered: false
        };

        orders.push(newOrder);
        updateLocalStorage();
        renderOrders();
        orderForm.reset();
    });
});
