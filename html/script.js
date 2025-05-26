/* © 2024 AlphaDev. All Rights Reserved. */

let vehicleStatus = {
    inVehicle: false,
    engineRunning: false,
    doorStatus: {},
    windowStatus: {},
    seatStatus: {},
    maxSeats: 0
};

window.addEventListener('message', function(event) {
    const data = event.data;

    if (data.type === "openMenu") {
        vehicleStatus = data.vehicleStatus;
        document.getElementById('vehicle-menu').classList.remove('hidden');
        updateUI();
    } else if (data.type === "updateStatus") {
        vehicleStatus = data.vehicleStatus;
        updateUI();
    }
});

function updateUI() {
    if (!vehicleStatus.inVehicle) return;

    const engineStatus = document.getElementById('engine-status');
    engineStatus.className = 'status-indicator';
    engineStatus.classList.add(vehicleStatus.engineRunning ? 'status-on' : 'status-off');

    for (let i = 0; i <= 5; i++) {
        const doorStatus = document.getElementById(`door-status-${i}`);
        if (doorStatus) {
            doorStatus.className = 'status-indicator';
            doorStatus.classList.add(vehicleStatus.doorStatus[i] ? 'status-on' : 'status-off');
        }
    }

    const allDoorsOpen = Object.values(vehicleStatus.doorStatus).some(status => status === true);
    const allDoorsStatus = document.getElementById('all-doors-status');
    if (allDoorsStatus) {
        allDoorsStatus.className = 'status-indicator';
        allDoorsStatus.classList.add(allDoorsOpen ? 'status-on' : 'status-off');
    }

    for (let i = 0; i <= 3; i++) {
        const windowStatus = document.getElementById(`window-status-${i}`);
        if (windowStatus) {
            windowStatus.className = 'status-indicator';
            windowStatus.classList.add(vehicleStatus.windowStatus[i] ? 'status-on' : 'status-off');
        }
    }

    const allWindowsOpen = Object.values(vehicleStatus.windowStatus).some(status => status === true);
    const allWindowsStatus = document.getElementById('all-windows-status');
    if (allWindowsStatus) {
        allWindowsStatus.className = 'status-indicator';
        allWindowsStatus.classList.add(allWindowsOpen ? 'status-on' : 'status-off');
    }

    updateSeats();
}

function updateSeats() {
    const seatsContainer = document.getElementById('seats-container');
    seatsContainer.innerHTML = '';

    const seatLabels = {
        '-1': 'Driver',
        '0': 'Front Passenger',
        '1': 'Rear Left',
        '2': 'Rear Right',
        '3': 'Extra Seat 1',
        '4': 'Extra Seat 2'
    };

    for (let i = -1; i < vehicleStatus.maxSeats - 1; i++) {
        if (i in vehicleStatus.seatStatus) {
            const seatItem = document.createElement('div');
            seatItem.className = 'menu-item';
            seatItem.setAttribute('data-seat', i);

            const iconContainer = document.createElement('div');
            iconContainer.className = 'icon-container';

            const icon = document.createElement('i');
            icon.className = i === -1 ? 'fas fa-steering-wheel' : 'fas fa-chair';

            const span = document.createElement('span');
            span.textContent = seatLabels[i] || `Seat ${i + 2}`;

            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'status-indicator';
            statusIndicator.classList.add(vehicleStatus.seatStatus[i] ? 'status-on' : 'status-off');

            iconContainer.appendChild(icon);
            seatItem.appendChild(iconContainer);
            seatItem.appendChild(span);
            seatItem.appendChild(statusIndicator);

            seatsContainer.appendChild(seatItem);
        }
    }

    document.querySelectorAll('[data-seat]').forEach(item => {
        item.addEventListener('click', function() {
            const seatIndex = parseInt(this.getAttribute('data-seat'));
            switchSeat(seatIndex);
        });
    });
}

function toggleAllDoors() {
    const anyDoorOpen = Object.values(vehicleStatus.doorStatus).some(status => status === true);

    for (let i = 0; i <= 5; i++) {
        fetch('https://alpha-vehiclemenu/toggleDoor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                doorIndex: i,
                forceState: !anyDoorOpen
            })
        });
    }
}

function toggleAllWindows() {
    const anyWindowOpen = Object.values(vehicleStatus.windowStatus).some(status => status === true);

    for (let i = 0; i <= 3; i++) {
        fetch('https://alpha-vehiclemenu/toggleWindow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                windowIndex: i,
                forceState: !anyWindowOpen
            })
        });
    }
}

function switchToDriverSeat() {
    switchSeat(-1);
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            this.classList.add('active');

            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    document.getElementById('close-menu').addEventListener('click', function() {
        document.getElementById('vehicle-menu').classList.add('hidden');
        fetch('https://alpha-vehiclemenu/closeMenu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
    });

    document.getElementById('engine-toggle').addEventListener('click', function() {
        fetch('https://alpha-vehiclemenu/toggleEngine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(resp => resp.json())
        .then(resp => {
            if (resp.engineState !== undefined) {
                vehicleStatus.engineRunning = resp.engineState;
                updateUI();

                const iconContainer = this.querySelector('.icon-container');
                iconContainer.classList.add('active');
                setTimeout(() => {
                    iconContainer.classList.remove('active');
                }, 500);
            }
        });
    });

    document.getElementById('all-doors-toggle').addEventListener('click', function() {
        toggleAllDoors();

        const iconContainer = this.querySelector('.icon-container');
        iconContainer.classList.add('active');
        setTimeout(() => {
            iconContainer.classList.remove('active');
        }, 500);
    });

    document.getElementById('all-windows-toggle').addEventListener('click', function() {
        toggleAllWindows();

        const iconContainer = this.querySelector('.icon-container');
        iconContainer.classList.add('active');
        setTimeout(() => {
            iconContainer.classList.remove('active');
        }, 500);
    });

    document.querySelectorAll('[data-door]').forEach(item => {
        item.addEventListener('click', function() {
            const doorIndex = parseInt(this.getAttribute('data-door'));
            fetch('https://alpha-vehiclemenu/toggleDoor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    doorIndex: doorIndex
                })
            })
            .then(resp => resp.json())
            .then(resp => {
                if (resp.doorState !== undefined) {
                    vehicleStatus.doorStatus[doorIndex] = resp.doorState;
                    updateUI();

                    const iconContainer = this.querySelector('.icon-container');
                    iconContainer.classList.add('active');
                    setTimeout(() => {
                        iconContainer.classList.remove('active');
                    }, 500);
                }
            });
        });
    });

    document.querySelectorAll('[data-window]').forEach(item => {
        item.addEventListener('click', function() {
            const windowIndex = parseInt(this.getAttribute('data-window'));
            fetch('https://alpha-vehiclemenu/toggleWindow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    windowIndex: windowIndex
                })
            })
            .then(resp => resp.json())
            .then(resp => {
                if (resp.windowState !== undefined) {
                    vehicleStatus.windowStatus[windowIndex] = resp.windowState;
                    updateUI();

                    const iconContainer = this.querySelector('.icon-container');
                    iconContainer.classList.add('active');
                    setTimeout(() => {
                        iconContainer.classList.remove('active');
                    }, 500);
                }
            });
        });
    });

    document.getElementById('quick-engine').addEventListener('click', function() {
        fetch('https://alpha-vehiclemenu/toggleEngine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(resp => resp.json())
        .then(resp => {
            if (resp.engineState !== undefined) {
                vehicleStatus.engineRunning = resp.engineState;
                updateUI();

                this.classList.add('active');
                setTimeout(() => {
                    this.classList.remove('active');
                }, 500);
            }
        });
    });

    document.getElementById('quick-doors').addEventListener('click', function() {
        toggleAllDoors();

        this.classList.add('active');
        setTimeout(() => {
            this.classList.remove('active');
        }, 500);
    });

    document.getElementById('quick-windows').addEventListener('click', function() {
        toggleAllWindows();

        this.classList.add('active');
        setTimeout(() => {
            this.classList.remove('active');
        }, 500);
    });

    document.getElementById('quick-driver').addEventListener('click', function() {
        switchToDriverSeat();

        this.classList.add('active');
        setTimeout(() => {
            this.classList.remove('active');
        }, 500);
    });
});

function switchSeat(seatIndex) {
    fetch('https://alpha-vehiclemenu/switchSeat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            seatIndex: seatIndex
        })
    })
    .then(resp => resp.json())
    .then(resp => {
        if (resp.success) {
            const seatItems = document.querySelectorAll('[data-seat]');
            seatItems.forEach(item => {
                if (parseInt(item.getAttribute('data-seat')) === seatIndex) {
                    const iconContainer = item.querySelector('.icon-container');
                    iconContainer.classList.add('active');
                    setTimeout(() => {
                        iconContainer.classList.remove('active');
                    }, 500);
                }
            });
        }
    });
}

document.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
        document.getElementById('vehicle-menu').classList.add('hidden');
        fetch('https://alpha-vehiclemenu/closeMenu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
    }
});