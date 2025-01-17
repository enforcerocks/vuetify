// Styles
import './VListItem.sass'

// Mixins
import Colorable from '../../mixins/colorable'
import Routable from '../../mixins/routable'
import { factory as GroupableFactory } from '../../mixins/groupable'
import Themeable from '../../mixins/themeable'
import { factory as ToggleableFactory } from '../../mixins/toggleable'

// Directives
import Ripple from '../../directives/ripple'

// Utilities
import { keyCodes } from './../../util/helpers'
import { ExtractVue } from './../../util/mixins'
import { removed } from '../../util/console'

// Types
import mixins from '../../util/mixins'
import { VNode } from 'vue'
import { PropValidator } from 'vue/types/options'

const baseMixins = mixins(
  Colorable,
  Routable,
  Themeable,
  GroupableFactory('listItemGroup'),
  ToggleableFactory('inputValue')
)

interface options extends ExtractVue<typeof baseMixins> {
  $el: HTMLElement
  isInGroup: boolean
  isInList: boolean
  isInMenu: boolean
  isInNav: boolean
}

/* @vue/component */
export default baseMixins.extend<options>().extend({
  name: 'v-list-item',

  directives: {
    Ripple,
  },

  inheritAttrs: false,

  inject: {
    isInGroup: {
      default: false,
    },
    isInList: {
      default: false,
    },
    isInMenu: {
      default: false,
    },
    isInNav: {
      default: false,
    },
  },

  props: {
    activeClass: {
      type: String,
      default (): string | undefined {
        if (!this.listItemGroup) return ''

        return this.listItemGroup.activeClass
      },
    } as any as PropValidator<string>,
    dense: Boolean,
    inactive: Boolean,
    link: Boolean,
    selectable: {
      type: Boolean,
    },
    tag: {
      type: String,
      default: 'div',
    },
    threeLine: Boolean,
    twoLine: Boolean,
    value: null as any as PropValidator<any>,
  },

  data: () => ({
    proxyClass: 'v-list-item--active',
  }),

  computed: {
    classes (): object {
      return {
        'v-list-item': true,
        ...Routable.options.computed.classes.call(this),
        'v-list-item--dense': this.dense,
        'v-list-item--disabled': this.disabled,
        'v-list-item--link': this.isClickable && !this.inactive,
        'v-list-item--selectable': this.selectable,
        'v-list-item--three-line': this.threeLine,
        'v-list-item--two-line': this.twoLine,
        ...this.themeClasses,
      }
    },
    isClickable (): boolean {
      return Boolean(
        Routable.options.computed.isClickable.call(this) ||
        this.listItemGroup
      )
    },
  },

  created () {
    /* istanbul ignore next */
    if (this.$attrs.hasOwnProperty('avatar')) {
      removed('avatar', this)
    }
  },

  methods: {
    click (e: MouseEvent | KeyboardEvent) {
      if (e.detail) this.$el.blur()

      this.$emit('click', e)

      this.to || this.toggle()
    },
    genAttrs () {
      const attrs: Record<string, any> = {
        'aria-disabled': this.disabled ? true : undefined,
        tabindex: this.isClickable && !this.disabled ? 0 : -1,
        ...this.$attrs,
      }

      if (this.$attrs.hasOwnProperty('role')) {
        // do nothing, role already provided
      } else if (this.isInNav) {
        // do nothing, role is inherit
      } else if (this.isInGroup) {
        attrs.role = 'listitem'
        attrs['aria-selected'] = String(this.isActive)
      } else if (this.isInMenu) {
        attrs.role = this.isClickable ? 'menuitem' : undefined
      } else if (this.isInList && !this.isLink) {
        attrs.role = 'listitem'
      }

      return attrs
    },
  },

  render (h): VNode {
    let { tag, data } = this.generateRouteLink()

    data.attrs = {
      ...data.attrs,
      ...this.genAttrs(),
    }
    data.on = {
      ...data.on,
      click: this.click,
      keydown: (e: KeyboardEvent) => {
        /* istanbul ignore else */
        if (e.keyCode === keyCodes.enter) this.click(e)

        this.$emit('keydown', e)
      },
    }

    const children = this.$scopedSlots.default
      ? this.$scopedSlots.default({
        active: this.isActive,
        toggle: this.toggle,
      })
      : this.$slots.default

    tag = this.inactive ? 'div' : tag

    return h(tag, this.setTextColor(this.color, data), children)
  },
})
