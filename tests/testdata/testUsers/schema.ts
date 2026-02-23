/**
 * Definice uživatelů pro aktuální projekt. Nové uživatele jednoduše přidej
 */
export type Users = {
    paymentsTestsUser: TestUser,
    accountsTestsUser: TestUser
}

/**
 * Schéma uživatele - jaká data musí mít a která jsou nepovinná. 
 * V tomto případě jsou loginNumber, password a oli povinná.
 */
export type TestUser = {

    loginNumber: string,
    password: string,
    token: string
    
}

/**
 * Schéma bankovního účtu a jeho povinných props.
 */
export type BankAccount = {
    iban: string,
    currency: string
}