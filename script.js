document.addEventListener('DOMContentLoaded', function () {
    const orderForm = document.getElementById('orderForm');
    const pendingOrdersContainer = document.getElementById('pendingOrdersContainer');
    const pastOrdersContainer = document.getElementById('pastOrdersContainer');

    // Load orders from localStorage on page load
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let pastOrders = JSON.parse(localStorage.getItem('pastOrders')) || [];

    // Display orders
    function renderOrders() {
        pendingOrdersContainer.innerHTML = '';
        pastOrdersContainer.innerHTML = '';

        orders.forEach(order => {
            const orderDiv = createOrderDiv(order);
            pendingOrdersContainer.appendChild(orderDiv);
        });

        pastOrders.forEach(order => {
            const orderDiv = createOrderDiv(order);
            orderDiv.classList.add('pastOrder');
            pastOrdersContainer.appendChild(orderDiv);
        });
    }

    // Create order div
    function createOrderDiv(order) {
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('order');
        orderDiv.textContent = order.name;
        
        const dispatchButton = document.createElement('button');
        dispatchButton.textContent = 'Dispatch';
        dispatchButton.addEventListener('click', function () {
            order.delivered = true;
            order.dateDelivered = new Date();
            orders = orders.filter(o => o !== order);
            pastOrders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.setItem('pastOrders', JSON.stringify(pastOrders));
            renderOrders();
        });

        orderDiv.appendChild(dispatchButton);
        return orderDiv;
    }

    renderOrders();

    // Handle form submission
    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const orderName = document.getElementById('orderName').value;
        const newOrder = {
            name: orderName,
            delivered: false,
            date: new Date()
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
        orderForm.reset();
    });

    // Check and remove delivered orders after 7 days
    setInterval(() => {
        const currentDate = new Date();
        pastOrders.forEach((order, index) => {
            const orderDate = new Date(order.dateDelivered);
            const diffTime = Math.abs(currentDate - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 7) {
                pastOrders.splice(index, 1);
                localStorage.setItem('pastOrders', JSON.stringify(pastOrders));
                renderOrders();
            }
        });
    }, 1000); // Check every second for simplicity
});
