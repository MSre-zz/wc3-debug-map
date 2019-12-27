import { addScriptHook, Unit } from 'w3ts';
import { MSX } from 'Systems/MSX';

export module abil1 {

    //BEGIN CONFIGURABLES
    const ABIL_ID = FourCC("abcd");
    const DURATION = 7.0;


    function bonusPureSpeed(abilityLevel: number) : number {
        return 30.0 + (15.0 * abilityLevel);
    }

    function bonusFactorSpeed(abilityLevel: number) : number {
        return 0.22 + (0.02 * abilityLevel);
    }

    function damagePerStack(abilityLevel: number, attribute: number) : number {
        return (0.63 * attribute * abilityLevel) + 25;
    }
    //END CONFIGURABLES

    

    export function onInit() {
        let t = CreateTrigger();

        TriggerRegisterAnyUnitEventBJ(t, EVENT_PLAYER_UNIT_SPELL_EFFECT);
        TriggerAddCondition(t, Condition(() => {

            let u = GetTriggerUnit();
            let abilityLevel: number = GetUnitAbilityLevel(u, ABIL_ID);
            let pureBonus: number = bonusPureSpeed(abilityLevel);
            let factorBonus: number = bonusFactorSpeed(abilityLevel);
            SetUnitMoveSpeed(u, 522.0);
            SetUnitState(u, UNIT_STATE_MANA, GetUnitState(u, UNIT_STATE_MAX_MANA));
            MSX.addSpeedFactor(u, factorBonus);
            MSX.addSpeedPure(u, pureBonus);

            print("ms=", MSX.getMoveSpeed(u));
            TimerStart(CreateTimer(), DURATION, false, () => {
                print("removing");
                MSX.removeSpeedFactor(u, factorBonus);
                MSX.removeSpeedPure(u, pureBonus);
                print("ms=", MSX.getMoveSpeed(u));
            })

            return false;
        }))
    }
}