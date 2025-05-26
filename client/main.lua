-- © 2024 AlphaDev. All Rights Reserved.

local QBCore = exports['qb-core']:GetCoreObject()
local isMenuOpen = false

local function ToggleEngine()
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle ~= 0 then
        local engineRunning = GetIsVehicleEngineRunning(vehicle)
        SetVehicleEngineOn(vehicle, not engineRunning, false, true)
        return not engineRunning
    end
    return false
end

local function ControlDoor(vehicle, doorIndex, toggle, forceState)
    if vehicle ~= 0 then
        if toggle then
            local isDoorOpen = GetVehicleDoorAngleRatio(vehicle, doorIndex) > 0.0

            if forceState ~= nil then
                if forceState then
                    SetVehicleDoorOpen(vehicle, doorIndex, false, false)
                    return true
                else
                    SetVehicleDoorShut(vehicle, doorIndex, false)
                    return false
                end
            else
                if isDoorOpen then
                    SetVehicleDoorShut(vehicle, doorIndex, false)
                    return false
                else
                    SetVehicleDoorOpen(vehicle, doorIndex, false, false)
                    return true
                end
            end
        else
            return GetVehicleDoorAngleRatio(vehicle, doorIndex) > 0.0
        end
    end
    return false
end

local function ControlWindow(vehicle, windowIndex, toggle, forceState)
    if vehicle ~= 0 then
        if toggle then
            local isWindowDown = not IsVehicleWindowIntact(vehicle, windowIndex)

            if forceState ~= nil then
                if forceState then
                    RollDownWindow(vehicle, windowIndex)
                    return true
                else
                    RollUpWindow(vehicle, windowIndex)
                    return false
                end
            else
                if isWindowDown then
                    RollUpWindow(vehicle, windowIndex)
                    return false
                else
                    RollDownWindow(vehicle, windowIndex)
                    return true
                end
            end
        else
            return not IsVehicleWindowIntact(vehicle, windowIndex)
        end
    end
    return false
end

local function SwitchSeat(vehicle, seatIndex)
    if vehicle ~= 0 then
        if IsVehicleSeatFree(vehicle, seatIndex) then
            SetPedIntoVehicle(PlayerPedId(), vehicle, seatIndex)
            return true
        end
    end
    return false
end
RegisterNUICallback('closeMenu', function(data, cb)
    SetNuiFocus(false, false)
    isMenuOpen = false
    cb('ok')
end)

RegisterNUICallback('toggleEngine', function(data, cb)
    local state = ToggleEngine()
    cb({engineState = state})
end)

RegisterNUICallback('toggleDoor', function(data, cb)
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle == 0 then vehicle = GetVehiclePedIsIn(PlayerPedId(), true) end

    local doorIndex = tonumber(data.doorIndex)
    local forceState = data.forceState
    local state = ControlDoor(vehicle, doorIndex, true, forceState)
    cb({doorState = state})
end)

RegisterNUICallback('toggleWindow', function(data, cb)
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle == 0 then vehicle = GetVehiclePedIsIn(PlayerPedId(), true) end

    local windowIndex = tonumber(data.windowIndex)
    local forceState = data.forceState
    local state = ControlWindow(vehicle, windowIndex, true, forceState)
    cb({windowState = state})
end)

RegisterNUICallback('switchSeat', function(data, cb)
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    local seatIndex = tonumber(data.seatIndex)
    local success = SwitchSeat(vehicle, seatIndex)
    cb({success = success})
end)

local function GetVehicleStatus()
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle == 0 then
        vehicle = GetVehiclePedIsIn(PlayerPedId(), true)
        if vehicle == 0 then
            return {inVehicle = false}
        end
    end

    local engineRunning = GetIsVehicleEngineRunning(vehicle)
    local doorStatus = {
        [0] = GetVehicleDoorAngleRatio(vehicle, 0) > 0.0,
        [1] = GetVehicleDoorAngleRatio(vehicle, 1) > 0.0,
        [2] = GetVehicleDoorAngleRatio(vehicle, 2) > 0.0,
        [3] = GetVehicleDoorAngleRatio(vehicle, 3) > 0.0,
        [4] = GetVehicleDoorAngleRatio(vehicle, 4) > 0.0,
        [5] = GetVehicleDoorAngleRatio(vehicle, 5) > 0.0
    }

    local windowStatus = {
        [0] = not IsVehicleWindowIntact(vehicle, 0),
        [1] = not IsVehicleWindowIntact(vehicle, 1),
        [2] = not IsVehicleWindowIntact(vehicle, 2),
        [3] = not IsVehicleWindowIntact(vehicle, 3)
    }

    local maxSeats = GetVehicleMaxNumberOfPassengers(vehicle) + 1
    local seatStatus = {}

    for i = -1, maxSeats - 2 do
        seatStatus[i] = IsVehicleSeatFree(vehicle, i)
    end

    return {
        inVehicle = true,
        engineRunning = engineRunning,
        doorStatus = doorStatus,
        windowStatus = windowStatus,
        seatStatus = seatStatus,
        maxSeats = maxSeats
    }
end

RegisterCommand(Config.CommandName, function()
    local ped = PlayerPedId()
    local vehicle = GetVehiclePedIsIn(ped, false)
    local nearVehicle = GetVehiclePedIsIn(ped, true)

    if vehicle ~= 0 or nearVehicle ~= 0 then
        if Config.RequireKeys then
            local plate = GetVehicleNumberPlateText(vehicle ~= 0 and vehicle or nearVehicle)
            local hasKeys = exports['qb-vehiclekeys']:HasKeys(plate)

            if not hasKeys then
                QBCore.Functions.Notify('You don\'t have the keys for this vehicle', 'error')
                return
            end
        end

        if not isMenuOpen then
            isMenuOpen = true
            SetNuiFocus(true, true)
            SendNUIMessage({
                type = "openMenu",
                vehicleStatus = GetVehicleStatus(),
                config = Config.UISettings
            })
        end
    else
        QBCore.Functions.Notify(Config.Notifications.NoVehicle, 'error')
    end
end)

if Config.KeyBind then
    RegisterKeyMapping(Config.CommandName, 'Open Vehicle Menu', 'keyboard', Config.KeyBind)
end

CreateThread(function()
    while true do
        if isMenuOpen then
            SendNUIMessage({
                type = "updateStatus",
                vehicleStatus = GetVehicleStatus()
            })
            Wait(500)
        else
            Wait(1000)
        end
    end
end)