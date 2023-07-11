class Pandora::Indexing::FieldProcessor
  def run(source: nil, record: nil, field_keys: nil)
    @source = source
    @record = record
    @field_keys = field_keys
    @processed_fields = {}
    @non_vgbk_artists_list = Rails.configuration.x.indexing_non_vgbk_artists[:artists]

    @field_keys.each do |key|
      if @record.class != Hash && @record.respond_to?(key)
        value = @record.send(key)
      elsif @record.class == Hash && @record[key]
        value = @record[key]
      else
        next
      end

      processed_value = case key
      when 'record_id'
        if @source.respond_to?(:name)
          name = @source.send(:name)
        elsif @source[:name]
          name = @source[:name]
        else
          raise Pandora::Exception, "The source '#{@source}' could not provide its name for processing the field 'record_id'."
        end

        if value.is_a?(String) && value.start_with?(name)
          value
        else
          process_record_id(value, name)
        end
      when 'path'
        process_path(value)
      # Do not process the following fields.
      when 'is_main_record', 'date_range', 'rating_count', 'rating_average', 'comment_count', 'user_comments', 'record_object_id_count'
        value
      when 'artist_nested', 'title_nested', 'location_nested', 'credits_nested', 'rights_reproduction_nested', 'person_nested', 'authority_files'
        value
      else
        process_node_set(value)
      end

      if !processed_value.nil?
        @processed_fields.merge!({key => processed_value})
      end
    end

    @processed_fields
  end

  def process_record_id(record_id, source_name)
    if !record_id.is_a?(Array)
      if record_id.is_a?(String)
        record_id = [record_id]
      elsif record_id.is_a?(Nokogiri::XML::Text)
        record_id = [record_id.content]
      elsif record_id.is_a?(Nokogiri::XML::NodeSet)
        record_id = record_id.to_a
      else
        raise Pandora::Exception, "a record ID should be a String, Nokogiri::XML::Text, or Nokogiri::XML::NodeSet, not a #{record_id.class}"
      end
    end
    [source_name, Digest::SHA1.hexdigest(Array(record_id).join('|'))].join('-')
  end

  def process_path(path)
    path.to_s.strip
  end

  def process_node_set(node_set)
    if node_set.is_a?(Nokogiri::XML::NodeSet)
      node_set_array = node_set.to_a
    elsif node_set.is_a?(Array)
      node_set_array = node_set
    else
      node_set_array = [node_set.to_s]
    end

    node_set_array.map! { |node|
      node = node.to_s
      node = node.strip
      # Always remove empty brackets with any leading whitespace character
      node = node.gsub(/\s*\(\)/, "")
    }

    node_set_array.delete_if { |node|
      node.blank?
    }
  end
end