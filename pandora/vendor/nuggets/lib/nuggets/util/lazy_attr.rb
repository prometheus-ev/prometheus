require 'nuggets/lazy_attr'
module Util; LazyAttr = ::Nuggets::LazyAttr; end

warn "#{__FILE__}: Util::LazyAttr is deprecated, use Nuggets::LazyAttr instead." unless ENV['NUGGETS_DEPRECATED_UTIL_LAZY_ATTR']
