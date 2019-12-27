import { MSX } from 'Systems/MSX';

export module abil1 {

    /*
    globals
        private constant integer    ABIL_ID = 'A06T'
        private constant real       TEXT_SIZE = 0.024
        private constant real       TEXT_HEIGHT_OFFSET = 25
        private constant integer    TEXT_RED = 255
        private constant integer    TEXT_GREEN = 0
        private constant integer    TEXT_BLUE = 0
        private constant string     ON_APPLY_EFFECT = "Abilities\\Spells\\Human\\MarkOfChaos\\MarkOfChaosTarget.mdl" //occurs when the spell is cast
        private constant string     DURATION_EFFECT = "Abilities\\Weapons\\PhoenixMissile\\Phoenix_Missile_mini.mdl"  //remains on FT for the duration of the spell
        private constant string     EXPIRE_EFFECT       = "Abilities\\Spells\\Orc\\FeralSpirit\\feralspiritdone.mdl" //occurs on FT when the spell expires
        private constant string     EXPLOSION_EFFECT    = "Abilities\\Weapons\\Mortar\\MortarMissile.mdl" //occurs on units with a hit counter on them when the spell expires
    endglobals
    */

    //BEGIN CONFIGURABLES
    const ABIL_ID = FourCC("AHbn");
    const DURATION = 7.0;


    function bonusPureSpeed(abilityLevel: number) : number {
        return 30.0 + (20.0 * abilityLevel);
    }

    function bonusFactorSpeed(abilityLevel: number) : number {
        return 0.20 + (0.02 * abilityLevel);
    }

    function damagePerStack(abilityLevel: number, attribute: number) : number {
        return (0.63 * attribute * abilityLevel) + 25;
    }
    //END CONFIGURABLES



    class BurningAttack {
        caster: unit;
        onAttackTrig: trigger;
        attackedUnits: unit[] = [];

       /*local src = GetEventDamageSource()
        local tgt = BlzGetEventDamageTarget()
        local amt = GetEventDamage()
        local at = BlzGetEventAttackType()
        local dt = BlzGetEventDamageType()
        local wt = BlzGetEventWeaponType()*/


        constructor(caster: unit) {
            print("constructing");
            this.caster = caster;
            this.onAttackTrig = CreateTrigger();
            // TriggerRegisterUnitEvent(this.onAttackTrig, caster, EVENT_UNIT_DAMAGING);
            // TriggerRegisterVariableEvent
            TriggerRegisterVariableEvent(this.onAttackTrig, "udg_DamageEvent", EQUAL, 1.00)

            TriggerAddCondition(this.onAttackTrig, Condition(() => {
                print("a");
                print("attacker=", GetUnitName(GetEventDamageSource()));
                print("trigger=", GetUnitName(BlzGetEventDamageTarget()));
                print("attacked=", GetUnitName(GetTriggerUnit()));
                
                return false;
            }))
        }
    }

    export function onInit() {
        let t = CreateTrigger();

        TriggerRegisterAnyUnitEventBJ(t, EVENT_PLAYER_UNIT_SPELL_EFFECT);
        TriggerAddCondition(t, Condition(() => {
            if(GetSpellAbilityId() != ABIL_ID) return false;
            
            let u = GetTriggerUnit();
            let abilityLevel: number = GetUnitAbilityLevel(u, ABIL_ID);
            let pureBonus: number = bonusPureSpeed(abilityLevel);
            let factorBonus: number = bonusFactorSpeed(abilityLevel);
            SetUnitMoveSpeed(u, 522.0);
            SetUnitState(u, UNIT_STATE_MANA, GetUnitState(u, UNIT_STATE_MAX_MANA));
            SetHeroLevel(u, 10, false);
            MSX.addSpeedFactor(u, factorBonus);
            MSX.addSpeedPure(u, pureBonus);

            let b = new BurningAttack(u);

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