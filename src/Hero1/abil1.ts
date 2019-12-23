import { addScriptHook, Unit } from 'w3ts';

export module abil1 {

    const ABIL_ID = FourCC('abcd')

    export function onInit() {
        let t = CreateTrigger();

        TriggerRegisterAnyUnitEventBJ(t, EVENT_PLAYER_UNIT_SPELL_EFFECT);
        TriggerAddCondition(t, Condition(() => {
            print("//===Creating Unit class from handle===")
            const u = Unit.fromHandle(GetTriggerUnit());

            print("//=====End of unit class creation===")
            print("1", GetUnitName(GetTriggerUnit()));
            print("handleId=", GetHandleId(GetTriggerUnit()))
            
            print("2", u.name);
            print("3", u.nameProper);
            
            u.moveSpeed = 700;
            
            
            
            
            
            u.setScale(2.0, 2.0, 2.0);
            print("def");
            return false;
        }))
        print("fds");
    }
}

// addScriptHook("main::after", abil1.onInit);