-- © 2024 AlphaDev. All Rights Reserved.

local QBCore = exports['qb-core']:GetCoreObject()

AddEventHandler('onResourceStart', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then return end
    print('^5Alpha Vehicle Menu^7: Resource started successfully')
end)

