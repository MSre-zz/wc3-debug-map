export module MSX {
    //system for breaking the 522 movespeed cap

    //CONFIGURABLES
    //=================================================================
    //  This is the period on which all units will be run.
    // If you lower this value, movement bonuses will be smoother,
    // but will require more processing power (lag more).
    //  Also, the lower this is, the higher the move speed can be
    // before it starts bugging on waypoints. The lowest valid
    // period is 0.00125. A period of 0.00625 is very robust.
    // -J4L
    const PERIOD = 0.00625

    //END CONFIGURABLES
    let units: Map<number, MsxData> = new Map();
    let isTimerStarted: boolean = false;
    let periodicTimer = CreateTimer();

    //"local" variables for premature optimization 
    let X: number;
    let Y: number;
    let Xinc: number;
    let Yinc: number;
    let distance: number;

    class MsxData {
        x: number;
        y: number;
        u: unit;
        pureBonus: number;
        factBonus: number;

        constructor(
            U: unit
        ) {
            this.u = U;
            this.pureBonus = 0.0;
            this.factBonus = 0.0;
            this.x = GetUnitX(this.u);
            this.y = GetUnitY(this.u);
        }
    }

    function startTimer() {
        TimerStart(periodicTimer, PERIOD, true, () => {
            units.forEach((value: MsxData, key: number, map: Map<number, MsxData>) => {
                X = GetUnitX(value.u);
                Y = GetUnitY(value.u);
                if (!IsUnitPaused(value.u) && GetUnitAbilityLevel(value.u, FourCC("BSTN")) == 0 && GetUnitAbilityLevel(value.u, FourCC("BPSE")) == 0) {
                    if (value.x != X || value.y != Y) {
                        Xinc = X - value.x;
                        Yinc = Y - value.y;
                        if (value.factBonus != 0.0) {
                            X = X + (Xinc * value.factBonus);
                            Y = Y + (Yinc * value.factBonus);
                        }
                        if (value.pureBonus != 0.0) {
                            distance = SquareRoot((Xinc * Xinc) + (Yinc * Yinc));

                            if (distance > 0.01) {
                                X = X + ((Xinc / distance) * value.pureBonus);
                                Y = Y + ((Yinc / distance) * value.pureBonus);
                            }
                        }

                        SetUnitX(value.u, X);
                        SetUnitY(value.u, Y);
                    }
                }
                value.x = X;
                value.y = Y;
            });
        });
    }

    function checkTimer() {
        if (units.size == 0 && isTimerStarted) {
            isTimerStarted = false;
            PauseTimer(periodicTimer);
        } else if (units.size > 0 && !isTimerStarted) {
            isTimerStarted = true;
            startTimer();
        }
    }

    /**
     * Checks if the unit should be either added to the units map or removed
     */
    function checkUnit(msx: MsxData) {
        if (msx.factBonus == 0.0 && msx.pureBonus == 0.0) {
            units.delete(GetHandleId(msx.u));        
        } else {
            units.set(GetHandleId(msx.u), msx);
        }
    }

    function getOrCreateData(u: unit) : MsxData {
        let handleId = GetHandleId(u);
        let msxData = units.get(handleId);
        if(msxData === undefined) {
            return new MsxData(u);
        } else {
            return msxData;
        }
    }

    /**
     * 
     * @param whichUnit whichUnit
     * @param pureBonus real number indicating a flat movespeed bonus for the unit. Cannot be reduced except by MSX.
     */
    export function addSpeedPure(whichUnit: unit, pureBonus: number) {
        if (GetUnitAbilityLevel(whichUnit, FourCC("Aloc")) == 0 && !IsUnitType(whichUnit, UNIT_TYPE_STRUCTURE)) {
            let msxData = getOrCreateData(whichUnit);
            msxData.pureBonus += (pureBonus * PERIOD);

            checkUnit(msxData);
            checkTimer();
        }
    }

    /**
     * 
     * @param whichUnit whichUnit
     * @param pureBonus real number indicating a flat movespeed bonus for the unit. Cannot be reduced except by MSX.
     */
    export function removeSpeedPure(whichUnit: unit, pureBonus: number) {
        addSpeedPure(whichUnit, -1 * pureBonus);
    }

    /**
     * 
     * @param whichUnit
     * @param factorBonus real number indicating % movespeed bonus. 1.00 = 100%. 0.50 = 50% etc. Stacks incrementally and does NOT increase MSX-pure speed
     */
    export function addSpeedFactor(whichUnit: unit, factorBonus: number) {
        if (GetUnitAbilityLevel(whichUnit, FourCC("Aloc")) == 0 && !IsUnitType(whichUnit, UNIT_TYPE_STRUCTURE)) {
            let msxData = getOrCreateData(whichUnit);
            msxData.factBonus += factorBonus;
        
            checkUnit(msxData);
            checkTimer();
        }
    }

    /**
     * 
     * @param whichUnit
     * @param factorBonus real number indicating % movespeed bonus. 1.00 = 100%. 0.50 = 50% etc. Stacks incrementally and does NOT increase MSX-pure speed
     */
    export function removeSpeedFactor(whichUnit: unit, factorBonus: number) {
        addSpeedFactor(whichUnit, -1 * factorBonus);
    }

    /**
     * 
     * @param whichUnit whichUnit
     * returns movespeed + MSX bonuses
     */
    export function getMoveSpeed(whichUnit: unit) : number {
        let msxData = getOrCreateData(whichUnit);
        return GetUnitMoveSpeed(whichUnit) * (1.0 + msxData.factBonus) + Math.round(msxData.pureBonus / PERIOD);
    }
}