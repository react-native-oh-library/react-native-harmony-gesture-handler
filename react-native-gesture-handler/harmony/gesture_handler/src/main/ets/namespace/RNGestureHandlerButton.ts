// This file was generated.
import {
  Descriptor as ComponentDescriptor,
  ViewBaseProps,
  ViewRawProps,
  ViewDescriptorWrapperBase,
  ColorValue,
  Color,
  RNInstance,
  Tag,
  RNComponentCommandReceiver,
  ViewPropsSelector,
} from 'RNOH/ts';


export namespace RNGestureHandlerButton {
  export const NAME = "RNGestureHandlerButton" as const

  export interface DirectRawProps {
    exclusive?: boolean;
    foreground?: boolean;
    borderless?: boolean;
    enabled?: boolean;
    rippleColor?: ColorValue;
    rippleRadius?: number;
    touchSoundDisabled?: boolean;
  }
  
  export interface Props extends ViewBaseProps {}
  
  export interface State {}
  
  export interface RawProps extends ViewRawProps, DirectRawProps {}
  
  export class PropsSelector extends ViewPropsSelector<Props, RawProps> {
    get exclusive() {
      return this.rawProps.exclusive ?? true;
    }
    
    get foreground() {
      return this.rawProps.foreground ?? false;
    }
    
    get borderless() {
      return this.rawProps.borderless ?? false;
    }
    
    get enabled() {
      return this.rawProps.enabled ?? true;
    }
    
    get rippleRadius() {
      return this.rawProps.rippleRadius ?? 0;
    }
    
    get touchSoundDisabled() {
      return this.rawProps.touchSoundDisabled ?? false;
    }
    
  
    get rippleColor() {
        if (this.rawProps.rippleColor) {
          return Color.fromColorValue(this.rawProps.rippleColor)
        } else {
          return new Color({ r: 0, g: 0, b: 0, a: 255})
        }
    }
    
  }

  export type Descriptor = ComponentDescriptor<
    typeof NAME,
    Props,
    State,
    RawProps
  >;
  
  export class DescriptorWrapper extends ViewDescriptorWrapperBase<
    typeof NAME,
    Props,
    State,
    RawProps,
    PropsSelector
  > {
    protected createPropsSelector() {
      return new PropsSelector(this.descriptor.props, this.descriptor.rawProps)
    }
  }
  
  export interface EventPayloadByName {
  }
  
  export class EventEmitter {
    constructor(private rnInstance: RNInstance, private tag: Tag) {}
    
    emit<TEventName extends keyof EventPayloadByName>(eventName: TEventName, payload: EventPayloadByName[TEventName]) {
      this.rnInstance.emitComponentEvent(this.tag, eventName, payload)
    }
  }
  
  export interface CommandArgvByName {
  }
  
  export class CommandReceiver {
    private listenersByCommandName = new Map<string, Set<(...args: any[]) => void>>()
    private cleanUp: (() => void) | undefined = undefined
  
    constructor(private componentCommandReceiver: RNComponentCommandReceiver, private tag: Tag) {
    }
  
    subscribe<TCommandName extends keyof CommandArgvByName>(commandName: TCommandName, listener: (argv: CommandArgvByName[TCommandName]) => void) {
      if (!this.listenersByCommandName.has(commandName)) {
        this.listenersByCommandName.set(commandName, new Set())
      }
      this.listenersByCommandName.get(commandName)!.add(listener)
      const hasRegisteredCommandReceiver = !!this.cleanUp
      if (!hasRegisteredCommandReceiver) {
        this.cleanUp = this.componentCommandReceiver.registerCommandCallback(this.tag, (commandName: string, argv: any[]) => {
          if (this.listenersByCommandName.has(commandName)) {
            const listeners = this.listenersByCommandName.get(commandName)!
            listeners.forEach(listener => {
              listener(argv)
            })
          }
        })
      }
  
      return () => {
        this.listenersByCommandName.get(commandName)?.delete(listener)
        if (this.listenersByCommandName.get(commandName)?.size ?? 0 === 0) {
          this.listenersByCommandName.delete(commandName)
        }
        if (this.listenersByCommandName.size === 0) {
          this.cleanUp?.()
        }
      }
    }
  }

}
