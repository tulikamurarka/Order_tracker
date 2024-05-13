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
        orderDiv.textContent = order.name + " - Taken on: " + order.dateTaken;
        
        if (!order.delivered) {
            const dispatchButton = document.createElement('button');
            dispatchButton.textContent = 'Dispatch';
            dispatchButton.addEventListener('click', function () {
                order.delivered = true;
                order.dateDispatched = new Date().toISOString().substring(0, 10); // Record only the date part
                const daysToDispatch = calculateDays(order.dateTaken, order.dateDispatched);
                order.dispatchTime = daysToDispatch;
                orders = orders.filter(o => o !== order);
                pastOrders.push(order);
                localStorage.setItem('orders', JSON.stringify(orders));
                localStorage.setItem('pastOrders', JSON.stringify(pastOrders));
                renderOrders();
            });

            orderDiv.appendChild(dispatchButton);
        } else {
            const timeDiv = document.createElement('div');
            timeDiv.textContent = `Dispatched in ${order.dispatchTime} days`;
            orderDiv.appendChild(timeDiv);
        }
        
        return orderDiv;
    }

    function calculateDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    renderOrders();

    // Handle form submission
    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const orderName = document.getElementById('orderName').value;
        const orderTakenDate = document.getElementById('orderTakenDate').value; // Get the taken date from the form

        const newOrder = {
            name: orderName,
            dateTaken: orderTakenDate,
            delivered: false
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
            if (order.delivered) {
                const orderDate = new Date(order.dateDispatched);
                const diffTime = Math.abs(currentDate - orderDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 7) {
                    pastOrders.splice(index, 1);
                    localStorage.setItem('pastOrders', JSON.stringify(pastOrders));
                    renderOrders();
                }
            }
        });
    }, 1000); // Check every second for simplicity
});
